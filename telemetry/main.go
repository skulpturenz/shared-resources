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
	SIGNOZ_PATCH = ferrite.
			String("SIGNOZ_PATCH", "Signoz config patch").
			Required()
)

func main() {
	ferrite.Init()

	pulumi.Run(func(ctx *pulumi.Context) error {
		configPatchUrl, err := storage.GetObjectSignedUrl(ctx, &storage.GetObjectSignedUrlArgs{
			Bucket: "skulpture-shared-telemetry",
			Path:   fmt.Sprintf("patch/%s", SIGNOZ_PATCH.Value()),
		})
		if err != nil {
			return err
		}

		createdInstance, err := compute.NewInstance(ctx, COMPUTE_INSTANCE_NAME.Value(), &compute.InstanceArgs{
			Name:        pulumi.String(COMPUTE_INSTANCE_NAME.Value()),
			MachineType: pulumi.String("f1-micro"),
			Zone:        pulumi.String("australia-southeast1-a"),
			Tags:        pulumi.ToStringArray([]string{}),
			NetworkInterfaces: compute.InstanceNetworkInterfaceArray{
				&compute.InstanceNetworkInterfaceArgs{
					AccessConfigs: compute.InstanceNetworkInterfaceAccessConfigArray{
						nil,
					},
					Network: pulumi.String("default"),
				},
			},
			// Docker setup on Debian 12: https://www.thomas-krenn.com/en/wiki/Docker_installation_on_Debian_12
			// Signoz setup: https://signoz.io/docs/install/docker-swarm/
			// TODO: Manual or maybe just build a docker image
			// - https://signoz.io/docs/monitor-http-endpoints/
			// - https://signoz.io/docs/userguide/otlp-http-enable-cors/
			// - https://signoz.io/docs/operate/
			MetadataStartupScript: pulumi.String(fmt.Sprintf(`sudo apt update &&
				sudo apt install git ca-certificates curl gnupg apt-transport-https gpg -y &&
				curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg &&
				echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null &&
				sudo apt update &&
				sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose -y &&
				git clone -b v0.46.0-389f22cf6 https://github.com/SigNoz/signoz.git && cd signoz/deploy/ &&
				curl '%s' > otel-collector-config.patch &&
				git apply otel-collector-config.patch &&
				sudo docker swarm init &&
				sudo docker stack deploy -c docker-swarm/clickhouse-setup/docker-compose.yaml signoz &&
				sudo docker stack services signoz`, configPatchUrl.SignedUrl)),
			DeletionProtection:     pulumi.Bool(true),
			AllowStoppingForUpdate: pulumi.Bool(true),
			BootDisk: &compute.InstanceBootDiskArgs{
				InitializeParams: &compute.InstanceBootDiskInitializeParamsArgs{
					Image: pulumi.String("debian-12-bookworm-v20240515"),
					Type:  pulumi.String("pd-standard"),
				},
			},
			ShieldedInstanceConfig: &compute.InstanceShieldedInstanceConfigArgs{
				EnableIntegrityMonitoring: pulumi.Bool(true),
				EnableSecureBoot:          pulumi.Bool(true),
				EnableVtpm:                pulumi.Bool(true),
			},
		})
		if err != nil {
			return err
		}

		disk, err := compute.NewAttachedDisk(ctx, COMPUTE_INSTANCE_NAME.Value(), &compute.AttachedDiskArgs{
			Disk:     pulumi.String(COMPUTE_INSTANCE_NAME.Value()),
			Instance: createdInstance.SelfLink,
		})
		if err != nil {
			return err
		}

		ctx.Export("uri", createdInstance.SelfLink)
		ctx.Export("id", createdInstance.ID())
		ctx.Export("instanceId", createdInstance.InstanceId)
		ctx.Export("disk", disk.ID())

		createdInstance.SelfLink.ApplyT(func(selfLink string) error {
			instance, err := compute.LookupInstance(ctx, &compute.LookupInstanceArgs{
				SelfLink: &selfLink,
			})
			if err != nil {
				return err
			}

			_, err = cloudflare.NewRecord(ctx, COMPUTE_INSTANCE_NAME.Value(), &cloudflare.RecordArgs{
				ZoneId:  pulumi.String(CLOUDFLARE_ZONE_ID.Value()),
				Name:    pulumi.String("telemetry"),
				Value:   pulumi.String(instance.Hostname),
				Type:    pulumi.String("A"),
				Proxied: pulumi.Bool(true),
			})
			if err != nil {
				return err
			}

			return nil
		})

		return nil
	})
}
