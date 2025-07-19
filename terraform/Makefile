.PHONY: init plan apply destroy check

fmt:
	@echo "*** terraform fmt -recursive... ***" && docker compose run --rm terraform fmt -recursive

init:
	@echo "*** terraform init... ***" && docker compose run --rm terraform init

plan: check
	@echo "*** terraform plan... ***" && docker compose run --rm terraform plan

apply: check
	@echo "*** terraform apply... ***" && docker compose run --rm terraform apply

destroy: check
	@docker compose run --rm terraform destroy

# Checks run always before the other operations
check:
	@echo "*** tflint --recursive... ***" && tflint --recursive
	@echo "*** terraform validate... ***" && docker compose run --rm terraform validate
	@echo "*** terraform fmt -recursive... ***" && docker compose run --rm terraform fmt -recursive
