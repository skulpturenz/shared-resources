package main

import (
	"fmt"

	"github.com/dogmatiq/ferrite"
	"github.com/pulumi/pulumi-digitalocean/sdk/v4/go/digitalocean"
	"github.com/pulumi/pulumi-gcp/sdk/v7/go/gcp/compute"
	"github.com/pulumi/pulumi-gcp/sdk/v7/go/gcp/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

var (
	GOOGLE_PROJECT = ferrite.
			String("GOOGLE_PROJECT", "GCP Project").
			Required()
	DIGITALOCEAN_TOKEN = ferrite.
				String("DIGITALOCEAN_TOKEN", "DigitalOcean token").
				Required()
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		pool, err := iam.NewWorkloadIdentityPool(ctx, "shared-resources-wif-pool", &iam.WorkloadIdentityPoolArgs{
			WorkloadIdentityPoolId: pulumi.String("shared-resources"),
		})
		if err != nil {
			return err
		}

		ctx.Export("wifPool", pool.Name)

		githubProvider, err := iam.NewWorkloadIdentityPoolProvider(ctx, "shared-resources", &iam.WorkloadIdentityPoolProviderArgs{
			WorkloadIdentityPoolId:         pool.WorkloadIdentityPoolId,
			WorkloadIdentityPoolProviderId: pulumi.String("github"),
			DisplayName:                    pulumi.String("Github"),
			AttributeMapping: pulumi.StringMap{
				"google.subject":       pulumi.String("assertion.sub"),
				"attribute.actor":      pulumi.String("assertion.actor"),
				"attribute.repository": pulumi.String("assertion.repository_owner"),
				"attribute.ref":        pulumi.String("assertion.ref"),
			},
			Oidc: &iam.WorkloadIdentityPoolProviderOidcArgs{
				IssuerUri: pulumi.String("https://token.actions.githubusercontent.com"),
			},
		})
		if err != nil {
			return err
		}

		ctx.Export("githubWIFProvider", githubProvider.Name)

		const REPOSITORY = "nmathew98/shared-resources"
		pool.Name.ApplyT(func(workloadIdentityPoolId string) error {
			principalSet := fmt.Sprintf("principalSet://iam.googleapis.com/%s/attribute.repository/%s", workloadIdentityPoolId, REPOSITORY)

			services := []string{"shared-authnz", "shared-rollout", "shared-telemetry"}

			for _, service := range services {
				_, err = compute.NewInstanceIAMBinding(ctx, fmt.Sprintf("%s-compute-admin", service), &compute.InstanceIAMBindingArgs{
					Zone:         pulumi.String("australia-southeast1-a"),
					InstanceName: pulumi.String(service),
					Role:         pulumi.String("roles/compute.admin"),
					Members:      pulumi.ToStringArray([]string{principalSet}),
				})
				if err != nil {
					return err
				}
			}

			return nil
		})

		sharedResourcesNetwork, err := compute.NewNetwork(ctx, "shared-resources-network", &compute.NetworkArgs{
			Name:        pulumi.String("shared-resources-network"),
			Description: pulumi.String("Allows Cloudflare sources only"),
		})
		if err != nil {
			return err
		}

		ctx.Export("sharedResourceNetwork", sharedResourcesNetwork.Name)

		_, err = compute.NewFirewall(ctx, "allow-cloudflare", &compute.FirewallArgs{
			Name:        pulumi.String("allow-cloudflare"),
			Network:     sharedResourcesNetwork.Name,
			Description: pulumi.StringPtr("Allow all traffic from Cloudflare"),
			Allows: compute.FirewallAllowArray{
				&compute.FirewallAllowArgs{
					Protocol: pulumi.String("tcp"),
					Ports: pulumi.StringArray{
						pulumi.String("0-65535"),
					},
				},
			},
			SourceRanges: pulumi.ToStringArray([]string{
				"173.245.48.0/20",
				"103.21.244.0/22",
				"103.22.200.0/22",
				"103.31.4.0/22",
				"141.101.64.0/18",
				"108.162.192.0/18",
				"190.93.240.0/20",
				"188.114.96.0/20",
				"197.234.240.0/22",
				"198.41.128.0/17",
				"162.158.0.0/15",
				"104.16.0.0/13",
				"104.24.0.0/14",
				"172.64.0.0/13",
				"131.0.72.0/22",
			},
			),
			TargetTags: pulumi.StringArray{
				pulumi.String("allow-cloudflare"),
			},
		})
		if err != nil {
			return err
		}

		_, err = compute.NewFirewall(ctx, "allow-icmp", &compute.FirewallArgs{
			Name:        pulumi.String("allow-icmp"),
			Network:     sharedResourcesNetwork.Name,
			Description: pulumi.StringPtr("Allow ICMP"),
			Allows: compute.FirewallAllowArray{
				&compute.FirewallAllowArgs{
					Protocol: pulumi.String("icmp"),
				},
			},
			SourceRanges: pulumi.ToStringArray([]string{
				"0.0.0.0",
			},
			),
			TargetTags: pulumi.StringArray{
				pulumi.String("allow-icmp"),
			},
		})
		if err != nil {
			return err
		}

		_, err = compute.NewFirewall(ctx, "allow-ssh", &compute.FirewallArgs{
			Name:        pulumi.String("allow-ssh"),
			Network:     sharedResourcesNetwork.Name,
			Description: pulumi.StringPtr("Allow SSH"),
			Allows: compute.FirewallAllowArray{
				&compute.FirewallAllowArgs{
					Protocol: pulumi.String("tcp"),
					Ports: pulumi.StringArray{
						pulumi.String("22"),
					},
				},
			},
			SourceRanges: pulumi.ToStringArray([]string{
				"0.0.0.0/0",
			},
			),
			TargetTags: pulumi.StringArray{
				pulumi.String("allow-ssh"),
			},
		})
		if err != nil {
			return err
		}

		cluster, err := digitalocean.NewDatabaseCluster(ctx, "shared-postgres", &digitalocean.DatabaseClusterArgs{
			Name:      pulumi.String("shared-postgres"),
			Engine:    pulumi.String("pg"),
			Version:   pulumi.String("16"),
			Size:      pulumi.String(digitalocean.DatabaseSlug_DB_1VPCU1GB),
			Region:    pulumi.String(digitalocean.RegionSYD1),
			NodeCount: pulumi.Int(1),
		})
		if err != nil {
			return err
		}

		_, err = digitalocean.NewDatabaseDb(ctx, "shared-postgres-1", &digitalocean.DatabaseDbArgs{
			ClusterId: cluster.ID(),
			Name:      pulumi.String("shared-postgres-1"),
		})
		if err != nil {
			return err
		}

		return nil
	})
}
