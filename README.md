# Synbionet Demo Backend
Docker setup with key services needed for the Bionet. This is primarily used for demonstrations and testing.  Services include:

- Local instance of Anvil to simulate Ethereum
- Indexer that captures on-chain events and stores them in a database
- Webapp with simple rest api to provide access to event data

## Get started
You'll need docker destop installed. From this directory, run `docker-compose up`.

- Anvil is available at `http://127.0.0.1:8545`

- Webapp base url: `http://127.0.0.1:8081`

The webapp provides the current endpoints:

- GET `/exchanges` returns a list of all exchanges
- GET `/services` returns a list of all services


