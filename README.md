# The Map: Backend Demo using Ocean.js

This is a Typescript-based demo that populates some Goal and Project nodes

It follows **[The Map software spec](https://docs.google.com/document/d/1yS5EBGSbyfGnAQXkVqc-jKegME8xDbsephDIKAGOl0g/edit#heading=h.rjp9y39k12t7)**, and leverages Ocean data NFTs.

It uses a precise data model, that has been added to the sw spec.

# Setup

## Prerequisites

- Linux/MacOS
- [Docker](https://docs.docker.com/engine/install/), [Docker Compose](https://docs.docker.com/compose/install/), [allowing non-root users](https://www.thegeekdiary.com/run-docker-as-a-non-root-user/)
- Node.js ([Install from here](https://nodejs.org/en/download/))

## Run local chain & Ocean services

Ocean `barge` runs Ganache (local blockchain), Provider (data service), and Aquarius (metadata cache).

In a new console:

```console
# Grab repo
git clone https://github.com/oceanprotocol/barge
cd barge

# Clean up old containers (to be sure)
docker system prune -a --volumes

# Start barge; deploy contracts; update ~/.ocean
./start_ocean.sh
```

## Install dependencies, including ocean.js

In a new console:

```console
yarn install
```

# Usage: Running Tests

In terminal:
```console
yarn start
```
