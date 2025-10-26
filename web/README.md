# Website

**Do not import from `@preact/signals-core`, but from `@preact/signals`.

## Deployment

Was deployed to Deno Deploy, but now I have to either use optimize or docker to
package the application and self host. Can't use Deno Deploy because I don't
know how to configure it for fresh in a monorepo...

### Compile

You can create a self-contained executable out of your app with the deno compile
command. It will include all assets and dependencies. This executable can run on
any platform without requiring Deno to be installed. Terminal (Shell/Bash)

```bash
# Build your app first
deno task build

# Generate self-contained executable
deno compile --output my-app --include _fresh -A _fresh/compiled-entry.js
```

The compiled entry supports two environment variables out of the box:

    `PORT` to set the port number (`PORT=4000 my-app`)
    `HOSTNAME` to set the host name number (`HOSTNAME=0.0.0.0 my-app`)

### Containerize

To build a new image:

```bash
# From monorepo root
deno task web:build:image
```

Then run your Docker container:

```bash
docker run -t -i -p 80:8000 dt-web
```

To deploy to a cloud provider, push it to a container registry and follow their
documentation.
