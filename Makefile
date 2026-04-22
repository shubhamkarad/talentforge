# Talentforge — convenience wrappers around pnpm / supabase / vercel commands.
# Everything here is a thin alias so the commands remain discoverable from `make`
# as well as documented for anyone who prefers pnpm directly.

.DEFAULT_GOAL := help
.PHONY: help setup install dev dev-recruiter dev-seeker build lint typecheck \
        format test db-start db-stop db-status db-reset db-push db-types db-studio \
        deploy-functions deploy-recruiter deploy-seeker clean

help: ## show available targets
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ---------------------------------------------------------------------------
# install / dev
# ---------------------------------------------------------------------------

setup: install ## full first-time setup
	@echo "==> setup complete. next: make db-start, then make dev"

install: ## pnpm install
	pnpm install

dev: ## run both apps (recruiter on :5173, seeker on :5174)
	pnpm dev

dev-recruiter: ## run only the recruiter console
	pnpm dev:recruiter

dev-seeker: ## run only the seeker app
	pnpm dev:seeker

build: ## production build of every workspace
	pnpm build

lint: ## turbo lint
	pnpm lint

typecheck: ## turbo typecheck
	pnpm typecheck

format: ## prettier write
	pnpm format

test: ## turbo test
	pnpm test

# ---------------------------------------------------------------------------
# supabase (local)
# ---------------------------------------------------------------------------

db-start: ## boot local supabase stack (needs Docker)
	pnpm supabase:start

db-stop: ## stop local supabase stack
	pnpm supabase:stop

db-status: ## show local supabase status + urls
	pnpm supabase:status

db-reset: ## drop + reapply migrations + seed
	pnpm supabase:reset

db-push: ## push migrations to the LINKED remote project
	pnpm supabase:push

db-types: ## regenerate packages/data-client/src/types/database.ts
	pnpm supabase:types

db-studio: ## open Supabase Studio in the browser
	supabase status | grep "Studio URL" || true

# ---------------------------------------------------------------------------
# deploy (remote)
# ---------------------------------------------------------------------------

deploy-functions: ## deploy all 5 edge functions
	supabase functions deploy score-fit
	supabase functions deploy career-forecast
	supabase functions deploy interview-prep
	supabase functions deploy extract-profile
	supabase functions deploy draft-job

deploy-recruiter: ## vercel deploy --prod for recruiter-console
	cd apps/recruiter-console && vercel --prod

deploy-seeker: ## vercel deploy --prod for seeker-app
	cd apps/seeker-app && vercel --prod

# ---------------------------------------------------------------------------
# cleanup
# ---------------------------------------------------------------------------

clean: ## remove every node_modules + every dist/
	pnpm clean
