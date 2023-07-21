/**
 * Basic indexer to capture and store bionet contract events.
 * Future version will use the graph protocol. This is mainly
 * used for demos and local testing.
 */
import { ethers } from 'ethers';
import axios from 'axios';
import { EventContainer, ExchangeState } from './types';


/**
 * Since the diamond pattern can view all facet events, we create a custom ABI 
 * that contains all the events of interest. The contract (below) that uses this
 * ABI also uses the deployed diamond contract address.
 */
const ABI = [
    "event ServiceCreated(uint256 indexed id, address indexed owner, string name, string uri, uint256 when)",
    "event ServiceUpdatedMetaUri(uint256 indexed id, string uri, uint256 when)",
    "event ServiceDeactivated(uint256 indexed id, uint256 when)",
    "event Offered(uint256 indexed exchangeId, uint256 indexed serviceId, address buyer, address seller, address moderator, uint256 price, uint256 when, string uri)",
    "event Funded(uint256 indexed exchangeId, uint256 price, uint256 when)",
    "event Disputed(uint256 indexed exchangeId, uint256 when)",
    "event Resolved(uint256 indexed exchangeId, uint8 refundType, uint256 when)",
    "event Refunded(uint256 indexed exchangeId, address signer, uint256 when)",
    "event Voided(uint256 indexed exchangeId, uint256 when)",
    "event Completed(uint256 indexed exchangeId, uint256 when)"
];

/**
 * Post events to the app server.
 * @param appUrl http address of the app server
 * @param event Event container
 */
async function shipit(appUrl: string, event: EventContainer) {
    try {
        await axios.post(appUrl, event);
    } catch (error) {
        console.log(`error on shipit: ${error}`);
    }
}

/**
 * Connect to Anvil and register event listeners.  Events are then
 * forwarded to app server and stored in the database.
 * @param anvil Anvil URL
 * @param app app server URL
 * @param bionet diamond contract address
 */
async function main(anvil: string, app: string, bionet: string) {
    const provider = new
        ethers.providers.WebSocketProvider(anvil);
    const contract = new ethers.Contract(bionet, ABI, provider);

    contract.on('ServiceCreated', async (id, owner, name, uri, when) => {
        await shipit(app, {
            event: 'ServiceCreated',
            data: {
                id: id.toNumber(),
                owner: owner,
                name: name,
                uri: uri,
                when: when.toNumber(),
                active: true
            }
        });
    });

    contract.on('ServiceUpdatedMetaUri', async (id, when) => {
        await shipit(app, {
            event: 'ServiceUpdatedMetaUri',
            data: {
                id: id.toNumber(),
                when: when.toNumber()
            }
        });
    });

    contract.on('ServiceDeactivated', async (id, uri, when) => {
        await shipit(app, {
            event: 'ServiceDeactivated',
            data: {
                id: id.toNumber(),
                uri: uri,
                when: when.toNumber(),
                active: false
            }
        });
    });

    contract.on('Offered', async (exchangeId, serviceId, buyer, seller, moderator, price, when, uri) => {
        await shipit(app, {
            event: 'Offered',
            data: {
                id: exchangeId.toNumber(),
                serviceId: serviceId.toNumber(),
                state: ExchangeState.Offered,
                buyer: buyer,
                seller: seller,
                moderator: moderator,
                price: price.toNumber(),
                when: when.toNumber(),
                uri: uri,
            }
        });
    });

    contract.on('Funded', async (exchangeId, price, when) => {
        await shipit(app, {
            event: 'Funded',
            data: {
                id: exchangeId.toNumber(),
                state: ExchangeState.Funded,
                when: when.toNumber(),
                price: price.toNumber(),
            }
        });
    });

    contract.on('Disputed', async (exchangeId, when) => {
        await shipit(app, {
            event: 'Disputed',
            data: {
                id: exchangeId.toNumber(),
                state: ExchangeState.Disputed,
                when: when.toNumber(),
            }
        })

    })

    contract.on('Resolved', async (exchangeId, refundType, when) => {
        await shipit(app, {
            event: 'Resolved',
            data: {
                id: exchangeId.toNumber(),
                state: ExchangeState.Resolved,
                when: when.toNumber(),
                refundType: refundType
            }
        })

    })

    contract.on('Refunded', async (exchangeId, signer, when) => {
        await shipit(app, {
            event: 'Refunded',
            data: {
                id: exchangeId.toNumber(),
                when: when.toNumber(),
                signer: signer
            }
        })

    })

    contract.on('Completed', async (exchangeId, when) => {
        await shipit(app, {
            event: 'Completed',
            data: {
                id: exchangeId.toNumber(),
                state: ExchangeState.Completed,
                when: when.toNumber(),
            }
        });
    })

    contract.on('Voided', async (exchangeId, when) => {
        await shipit(app, {
            event: 'Voided',
            data: {
                id: exchangeId.toNumber(),
                state: ExchangeState.Voided,
                when: when.toNumber(),
            }
        });
    })
}


(async () => {
    const msg = 'missing required env variables';
    // ENV: BIONET_ADDRESS (diamond contract address)
    //      ANVIL_URL (anvil url)
    //      BIONET_APP (app server url)
    if (!process.env.BIONET_ADDRESS) throw Error(msg)
    if (!process.env.ANVIL_URL) throw Error(msg)
    if (!process.env.BIONET_APP) throw Error(msg)

    console.log(` ~ event indexer listening to ${process.env.ANVIL_URL} ~`);
    await main(
        process.env.ANVIL_URL,
        process.env.BIONET_APP,
        process.env.BIONET_ADDRESS
    );
})();
