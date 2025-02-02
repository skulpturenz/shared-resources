package main

import (
	"fmt"

	"github.com/dogmatiq/ferrite"
	"github.com/pulumi/pulumi-cloudflare/sdk/v5/go/cloudflare"
	"github.com/pulumi/pulumi-gcp/sdk/v7/go/gcp/compute"
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
	GOOGLE_SERVICE_ACCOUNT = ferrite.
				String("GOOGLE_SERVICE_ACCOUNT", "Service account linked to vm").
				Required()
	CLOUDFLARE_API_TOKEN = ferrite.
				String("CLOUDFLARE_API_TOKEN", "Cloudflare API token").
				Required()
	GCP_SSH_PUBLIC_KEY = ferrite.
				String("GCP_SSH_PUBLIC_KEY", "SSH key for this instance").
				Required()
)

func main() {
	ferrite.Init()

	pulumi.Run(func(ctx *pulumi.Context) error {
		static, err := compute.NewAddress(ctx, COMPUTE_INSTANCE_NAME.Value(), &compute.AddressArgs{
			Name:   pulumi.String(COMPUTE_INSTANCE_NAME.Value()),
			Region: pulumi.String("australia-southeast1"),
		})
		if err != nil {
			return err
		}

		instance, err := compute.NewInstance(ctx, COMPUTE_INSTANCE_NAME.Value(), &compute.InstanceArgs{
			Name:        pulumi.String(COMPUTE_INSTANCE_NAME.Value()),
			MachineType: pulumi.String("e2-medium"),
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
			Metadata: pulumi.ToStringMap(map[string]string{
				"ssh-keys": GCP_SSH_PUBLIC_KEY.Value(),
			}),
			// Docker setup on Debian 12: https://www.thomas-krenn.com/en/wiki/Docker_installation_on_Debian_12
			MetadataStartupScript: pulumi.String(fmt.Sprintf(`#! /bin/bash 
				curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
				sudo bash add-google-cloud-ops-agent-repo.sh --also-install

				sudo apt update &&
				sudo apt install certbot python3-certbot-dns-cloudflare make git ca-certificates curl gnupg apt-transport-https gpg -y &&
				curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg &&
				echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null &&
				sudo apt update &&
				sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose -y &&
				sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy && 
				echo "dns_cloudflare_api_token = %s" | sudo tee /etc/letsencrypt/dnscloudflare.ini &&
				echo "#! /bin/bash sudo docker service ls -q | xargs -n1 sudo docker service update --force" | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-services.sh &&
				sudo chmod 0600 /etc/letsencrypt/dnscloudflare.ini &&
				sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-services.sh &&
				sudo chmod 0600 /etc/letsencrypt/renewal-hooks/deploy/reload-services.sh &&
				sudo certbot certonly -d rollout.skulpture.xyz \
					--dns-cloudflare --dns-cloudflare-credentials /etc/letsencrypt/dnscloudflare.ini \
					--non-interactive --agree-tos \
					--register-unsafely-without-email \
					--dns-cloudflare-propagation-seconds 60
				EOF`, CLOUDFLARE_API_TOKEN.Value())),
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
					Size:  pulumi.Int(30),
				},
				AutoDelete: pulumi.Bool(false),
			},
			ServiceAccount: compute.InstanceServiceAccountArgs{
				Email: pulumi.StringPtr(GOOGLE_SERVICE_ACCOUNT.Value()),
				Scopes: pulumi.ToStringArray([]string{
					"cloud-platform",
				}),
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
			Content: static.Address,
			Type:    pulumi.String("A"),
			Proxied: pulumi.Bool(true),
		})
		if err != nil {
			return err
		}

		return nil
	})
}
