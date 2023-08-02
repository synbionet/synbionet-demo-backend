# Use the latest foundry image
FROM ghcr.io/foundry-rs/foundry

WORKDIR /opt/bionet
COPY state.json ./

EXPOSE 8545

# "--host 0.0.0.0"
CMD ["anvil --host 0.0.0.0 --load-state ./state.json"]
# CMD ["anvil --host 0.0.0.0"]