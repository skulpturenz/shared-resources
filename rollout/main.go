package main

import (
	"fmt"

	"github.com/dogmatiq/ferrite"
	"github.com/pulumi/pulumi-cloudflare/sdk/v5/go/cloudflare"
	"github.com/pulumi/pulumi-gcp/sdk/v7/go/gcp/compute"
	"github.com/pulumi/pulumi-gcp/sdk/v7/go/gcp/storage"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

var (
	COMPUTE_INSTANCE_NAME = ferrite.
				String("COMPUTE_INSTANCE_NAME", "Unique name for compute instance").
				Required()
	GOOGLE_PROJECT = ferrite.
			String("GOOGLE_PROJECT", "GCP Project").
			Required()
	CLOUDFLARE_ZONE_ID = ferrite.
				String("CLOUDFLARE_ZONE_ID", "Cloudflare zone id").
				Required()
	DOCKER_COMPOSE = ferrite.
			String("DOCKER_COMPOSE", "Docker compose file").
			Required()
	GOOGLE_SERVICE_ACCOUNT = ferrite.
		// See: https://www.pulumi.com/registry/packages/gcp/api-docs/storage/getobjectsignedurl/#credentials_go
		// `export GOOGLE_SERVICE_ACCOUNT=$(cat credentials.json)`
		String("GOOGLE_SERVICE_ACCOUNT", "Google service account credentials to obtain a signed url").
		Required()
	CLOUDFLARE_API_TOKEN = ferrite.
				String("CLOUDFLARE_API_TOKEN", "Cloudflare API token").
				Required()
)

func main() {
	ferrite.Init()

	pulumi.Run(func(ctx *pulumi.Context) error {
		composeFile, err := storage.GetObjectSignedUrl(ctx, &storage.GetObjectSignedUrlArgs{
			Bucket:      "skulpture-shared-resources",
			Path:        fmt.Sprintf("rollout/config/%s", DOCKER_COMPOSE.Value()),
			Credentials: pulumi.StringRef(GOOGLE_SERVICE_ACCOUNT.Value()),
		})
		if err != nil {
			return err
		}

		static, err := compute.NewAddress(ctx, COMPUTE_INSTANCE_NAME.Value(), &compute.AddressArgs{
			Name:   pulumi.String(COMPUTE_INSTANCE_NAME.Value()),
			Region: pulumi.String("australia-southeast1"),
		})
		if err != nil {
			return err
		}

		instance, err := compute.NewInstance(ctx, COMPUTE_INSTANCE_NAME.Value(), &compute.InstanceArgs{
			Name:        pulumi.String(COMPUTE_INSTANCE_NAME.Value()),
			MachineType: pulumi.String("e2-small"),
			Zone:        pulumi.String("australia-southeast1-a"),
			Tags: pulumi.ToStringArray([]string{
				"allow-cloudflare",
				"allow-ssh",
			}),
			NetworkInterfaces: compute.InstanceNetworkInterfaceArray{
				&compute.InstanceNetworkInterfaceArgs{
					AccessConfigs: compute.InstanceNetworkInterfaceAccessConfigArray{
						&compute.InstanceNetworkInterfaceAccessConfigArgs{
							NatIp: static.Address,
						},
					},
					Network: pulumi.String("shared-resources-network"),
				},
			},
			// Docker setup on Debian 12: https://www.thomas-krenn.com/en/wiki/Docker_installation_on_Debian_12
			// Signoz setup: https://signoz.io/docs/install/docker-swarm/
			// - https://signoz.io/docs/monitor-http-endpoints/
			// - https://signoz.io/docs/userguide/otlp-http-enable-cors/
			// - https://signoz.io/docs/operate/
			MetadataStartupScript: pulumi.String(fmt.Sprintf(`#! /bin/bash 
				sudo apt update &&
				sudo apt install git ca-certificates curl gnupg apt-transport-https gpg -y &&
				curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg &&
				echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null &&
				sudo apt update &&
				sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose -y &&
				curl '%s' > docker-compose.yaml &&
				sudo docker compose up
				EOF`, composeFile.SignedUrl)),
			Scheduling: compute.InstanceSchedulingArgs{
				AutomaticRestart:  pulumi.Bool(true),
				OnHostMaintenance: pulumi.String("MIGRATE"),
			},
			DeletionProtection:     pulumi.Bool(false),
			AllowStoppingForUpdate: pulumi.Bool(true),
			BootDisk: &compute.InstanceBootDiskArgs{
				InitializeParams: &compute.InstanceBootDiskInitializeParamsArgs{
					Image: pulumi.String("debian-12-bookworm-v20240515"),
					Type:  pulumi.String("pd-standard"),
					Size:  pulumi.Int(10),
				},
				AutoDelete: pulumi.Bool(true),
			},
		})
		if err != nil {
			return err
		}

		ctx.Export("uri", instance.SelfLink)
		ctx.Export("status", instance.CurrentStatus)
		ctx.Export("id", instance.ID())
		ctx.Export("instanceId", instance.InstanceId)
		ctx.Export("staticAddress", static.Address)

		_, err = cloudflare.NewRecord(ctx, COMPUTE_INSTANCE_NAME.Value(), &cloudflare.RecordArgs{
			ZoneId:  pulumi.String(CLOUDFLARE_ZONE_ID.Value()),
			Name:    pulumi.String("rollout"),
			Value:   static.Address,
			Type:    pulumi.String("A"),
			Proxied: pulumi.Bool(true),
		})
		if err != nil {
			return err
		}

		return nil
	})
}
