# LEDGER — the React app (apps/web), built and served by Next itself.
#
# The other way to run this game is one HTML file; see Dockerfile.static. This
# image is for the app: the same game inside the shell React draws, which is
# what a deploy with a service worker, a manifest and installable chrome uses.
#
#   docker build -t ledger-app .
#   docker run --rm -p 3007:3007 ledger-app
#
# Two stages, because the toolchain that builds the app (typescript, next's
# compiler, every workspace dependency) has no business in the image that runs
# it, and because a build cache inside the image is a build cache a deploy has
# to upload.

FROM node:20-bookworm-slim AS build
WORKDIR /repo

# only the manifests first: this layer is cached until a dependency changes,
# which is the difference between a 20-second deploy and a four-minute one
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/ui/package.json packages/ui/
COPY apps/web/package.json apps/web/
RUN npm ci --include-workspace-root

# then the source, and the app
COPY packages/ packages/
COPY apps/web/ apps/web/
RUN npm --workspace apps/web run build

FROM node:20-bookworm-slim AS run
WORKDIR /repo
ENV NODE_ENV=production
# the app needs its dependencies at run time; the toolchain does not need to be
# in the picture either. `npm ci` in this stage installs the same lockfile with
# production flags only.
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/ui/package.json packages/ui/
COPY apps/web/package.json apps/web/
RUN npm ci --include-workspace-root --omit=dev
COPY --from=build /repo/packages/core/ packages/core/
COPY --from=build /repo/packages/ui/ packages/ui/
COPY --from=build /repo/apps/web/.next apps/web/.next
COPY --from=build /repo/apps/web/public apps/web/public

EXPOSE 3007
# the preview host this runs behind is not localhost, so bind every interface
CMD ["npx", "next", "start", "-p", "3007", "-H", "0.0.0.0"]
