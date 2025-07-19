terraform {
  required_version = "~> 1.12.2"

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "kv5h"

    workspaces {
      name = "random-number-observation"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.2.0"
    }
  }
}

#----------
# Provider
#----------
provider "aws" {
  region = var.aws_region
}
