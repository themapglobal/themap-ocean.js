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

## Install dependencies, including ocean.py

In a new console:

```console
yarn install
```

## Set envvars
```console
# Set envvars
export TEST_PRIVATE_KEY1=0x8467415bb2ba7c91084d932276214b11a3dd9bdb2930fefa194b666dd8020b99

# Set the address file only for ganache
export ADDRESS_FILE=~/.ocean/ocean-contracts/artifacts/address.json

# Set network URL
export OCEAN_NETWORK_URL=http://127.0.0.1:8545
```

# Usage: Running Tests

In terminal:
```console
#run tests for one method, with print statements to console. "-s" is to show output
pytest test_themap.py::test1 -s

#run tests for one module
pytest test_themap.py

#run all tests
pytest
```

# Usage: Playing

Open a new console and:
```console
python
```

Open [test_themap.py](test_themap.py) in a separate browser window. Then to play, copy and paste code from it into the console.
