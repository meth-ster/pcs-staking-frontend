import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    ConnectionProvider,
    useAnchorWallet,
    WalletProvider
} from "@solana/wallet-adapter-react";
import {
    WalletModalProvider,
    WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { Program, Provider, BN, web3 } from "@project-serum/anchor";
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
    getOrCreateAssociatedTokenAccount,
    createTransferCheckedInstruction,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import idl from "./idl.json";


const programAddress = new PublicKey(
    '7ry4KgNYx5sd731MYpZkwH42gRxok5kSE74NXu2M5oEP'
);

const pcsAddress = new PublicKey(
    '2Y1U4GZ5dytoh8tQM5JeWHaehH2jotajZCrURMzFgFMr'
);

require("./App.css");
require("@solana/wallet-adapter-react-ui/styles.css");

const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({ network }),
            new SolletExtensionWalletAdapter({ network }),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    const wallet = useAnchorWallet();
    const secretKey = Uint8Array.from([26, 250, 47, 223, 59, 0, 19, 200, 43, 66, 176, 133, 181, 106, 229, 223, 28, 20, 29, 106, 48, 22, 199, 16, 254, 103, 179, 128, 144, 200, 202, 10, 193, 132, 30, 58, 26, 31, 124, 37, 186, 5, 195, 87, 239, 181, 219, 10, 3, 97, 108, 183, 98, 230, 0, 100, 241, 211, 28, 170, 227, 218, 223, 80])

    const [pcsAmount, setPcsAmount] = useState(0);
    const [metaDatas, setMetaDatas] = useState([]);


    const baseAccount = Keypair.fromSecretKey(secretKey)
    // const baseAccount = Keypair.generate();


    const getProgramPDA = async (): Promise<[PublicKey, number]> => {
        return await PublicKey.findProgramAddress(
            [pcsAddress.toBuffer()],
            programAddress
        );
    }

    const getUserTokenBagAddress = async (pubkey: PublicKey): Promise<PublicKey> => {
        if (!wallet) {
            return new PublicKey('');
        }
        const endpoint = clusterApiUrl(WalletAdapterNetwork.Devnet)
        const network = endpoint;
        const connection = new Connection(network, "processed");
        const provider = new Provider(connection, wallet, {
            preflightCommitment: "processed",
        });

        const secretKey = Uint8Array.from([205, 92, 88, 232, 250, 162, 206, 112, 4, 161, 219, 140, 108, 242, 195, 188, 201, 216, 209, 110, 107, 150, 58, 111, 53, 121, 51, 216, 220, 72, 211, 119, 49, 247, 122, 185, 153, 54, 53, 103, 164, 44, 47, 59, 217, 109, 204, 70, 22, 135, 204, 164, 154, 244, 174, 39, 128, 148, 234, 22, 21, 188, 214, 230])

        const signer = Keypair.fromSecretKey(secretKey)

        // var transaction = new web3.Transaction().add(
        //     web3.SystemProgram.transfer({
        //         fromPubkey: provider.wallet.publicKey,
        //         toPubkey: signer.publicKey,
        //         lamports: web3.LAMPORTS_PER_SOL / 1000 //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
        //     }),
        // );

        // // Setting the variables for the transaction
        // transaction.feePayer = await provider.wallet.publicKey;
        // let blockhashObj = await connection.getRecentBlockhash();
        // transaction.recentBlockhash = await blockhashObj.blockhash;

        // // Transaction constructor initialized successfully
        // if (transaction) {
        //     console.log("Txn created successfully");
        // }

        // // Request creator to sign the transaction (allow the transaction)
        // let signed = await provider.wallet.signTransaction(transaction);
        // // The signature is generated
        // let signature = await connection.sendRawTransaction(signed.serialize());
        // // Confirm whether the transaction went through or not
        // await connection.confirmTransaction(signature);


        const getOrCreateTokenBag = await getOrCreateAssociatedTokenAccount(
            connection,
            signer,
            pcsAddress,
            pubkey,
            false,
        );

        // balance = await connection.getBalance(signer.publicKey);
        // console.log("balance 2", balance)

        return getOrCreateTokenBag.address;
    }

    function getProvider() {
        if (!wallet) {
            return null;
        }
        const endpoint = clusterApiUrl(WalletAdapterNetwork.Devnet)
        const network = endpoint;
        const connection = new Connection(network, "processed");

        const provider = new Provider(connection, wallet, {
            preflightCommitment: "processed",
        });

        return provider;
    }

    async function get() {
        const provider = getProvider();
        if (!provider) {
            return;
        }

        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);
        try {

            const account = await program.account.stakeAccount.fetch(baseAccount.publicKey);

            const endpoint = clusterApiUrl(WalletAdapterNetwork.Devnet)
            const network = endpoint;
            const connection = new Connection(network, "processed");
            const tokenAmount = parseInt((await connection.getTokenAccountBalance(await getUserTokenBagAddress(provider.wallet.publicKey))).value.amount);

            console.log('account: ', account);
            console.log('stakedLastAmount', account.stakedLastAmount.toString())
            console.log('stakedCount', account.stakedCount.toString())

            setMetaDatas(account.list)

            console.log('detail 0', {
                holder: account.list[0].holder.toString(),
                pcsTokenAmount: account.list[0].pcsTokenAmount.toString(),
                stakeAmount: account.list[0].stakeAmount.toString(),
                stakeMode: account.list[0].stakeMode.toString(),
                stakeTime: account.list[0].stakeTime.toString(),
            })

            console.log('PCS Token Balance', tokenAmount / 1000000000.0)

            setPcsAmount(tokenAmount / 1000000000.0)

        }
        catch (err) {
            console.log("Transcation error: ", err);
        }
    }

    async function initialization() {
        const provider = getProvider();
        if (!provider) {
            return;
        }

        console.log('provider', provider)

        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);

        const [pda,] = await getProgramPDA();

        console.log("deb", {
            pcsMint: pcsAddress.toString(),
            programPcsTokenBag: pda.toString(),
            payer: provider.wallet.publicKey.toString(),
            // Solana is lost: where are my spl program friends?
            systemProgram: SystemProgram.programId.toString(),
            tokenProgram: TOKEN_PROGRAM_ID.toString(),
            rent: SYSVAR_RENT_PUBKEY.toString(),
        })

        try {
            const result = await program.rpc.createPcsTokenBag({
                accounts: {
                    pcsMint: pcsAddress,
                    programPcsTokenBag: pda,
                    payer: provider.wallet.publicKey,
                    // Solana is lost: where are my spl program friends?
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    rent: SYSVAR_RENT_PUBKEY
                }
            });

            console.log('Transaction: ', result)
        }
        catch (err) {
            console.log("Transcation error: ", err);
        }
    }

    async function initializationByAccount() {
        const provider = getProvider();
        if (!provider) {
            return;
        }

        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);

        try {
            await program.rpc.initialize({
                accounts: {
                    stakeAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                },
                signers: [baseAccount]
            });

            const account = await program.account.stakeAccount.fetch(baseAccount.publicKey);
            console.log('account: ', account);
        }
        catch (err) {
            console.log("Transcation error: ", err);
        }
    }

    async function stake() {
        const provider = getProvider();
        if (!provider) {
            return;
        }

        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);

        const [pda, bump] = await getProgramPDA();

        try {
            const result = await program.rpc.stake(
                bump,
                new BN(1_000_000),
                new BN(0),
                {
                    accounts: {
                        // Solana is lost: where are my spl program friends?
                        tokenProgram: TOKEN_PROGRAM_ID,
                        // **************
                        // TRANSFERING 🐮 FROM USERS
                        // **************
                        userPcsTokenBag: await getUserTokenBagAddress(provider.wallet.publicKey),
                        userPcsTokenBagAuthority: provider.wallet.publicKey,
                        programPcsTokenBag: pda,
                        pcsMint: pcsAddress,
                        stakeAccount: baseAccount.publicKey,
                        depositor: provider.wallet.publicKey,
                    },
                },
            );

            console.log('Transaction: ', result)
        }
        catch (err) {
            console.log("Transcation error: ", err);
        }
    }

    async function unStake() {
        const provider = getProvider();
        if (!provider) {
            return;
        }

        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);

        const [pda, bump] = await getProgramPDA();

        try {
            const result = await program.rpc.unstake(
                bump,
                new BN(0),
                {
                    accounts: {
                        tokenProgram: TOKEN_PROGRAM_ID,

                        // **************
                        // TRANSFER 🐮 TO USERS
                        // **************
                        programPcsTokenBag: pda,
                        userPcsTokenBag: await getUserTokenBagAddress(provider.wallet.publicKey),
                        pcsMint: pcsAddress,
                        stakeAccount: baseAccount.publicKey,
                        withdrawer: provider.wallet.publicKey,
                    },
                }
            );

            console.log('Transaction: ', result)
        }
        catch (err) {
            console.log("Transcation error: ", err);
        }
    }

    async function reStake() {
        const provider = getProvider();
        if (!provider) {
            return;
        }

        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);

        // const [pda, bump] = await getProgramPDA();

        try {
            const result = await program.rpc.restake(
                new BN(0),
                {
                    accounts: {
                        stakeAccount: baseAccount.publicKey,
                        withdrawer: provider.wallet.publicKey,
                    },
                },
            );

            console.log('Transaction: ', result)
        }
        catch (err) {
            console.log("Transcation error: ", err);
        }
    }

    async function deposit() {
        const provider = getProvider();
        if (!provider) {
            return;
        }

        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);

        const [pda, bump] = await getProgramPDA();

        try {
            const result = await program.rpc.deposit(
                bump,
                new BN(10_000_000_000),
                {
                    accounts: {
                        // Solana is lost: where are my spl program friends?
                        tokenProgram: TOKEN_PROGRAM_ID,
                        // **************
                        // TRANSFERING 🐮 FROM USERS
                        // **************
                        userPcsTokenBag: await getUserTokenBagAddress(provider.wallet.publicKey),
                        userPcsTokenBagAuthority: provider.wallet.publicKey,
                        programPcsTokenBag: pda,
                        pcsMint: pcsAddress
                    },
                },
            );

            console.log('Transaction: ', result)
        }
        catch (err) {
            console.log("Transcation error: ", err);
        }
    }

    async function send() {
        if (!wallet || receiverAddress == "") {
            return null;
        }
        const endpoint = clusterApiUrl(WalletAdapterNetwork.Devnet)
        const network = endpoint;
        const connection = new Connection(network, "processed");
        const provider = new Provider(connection, wallet, {
            preflightCommitment: "processed",
        });

        try {
            // var transaction = new web3.Transaction().add(
            //     createTransferCheckedInstruction(
            //         await getUserTokenBagAddress(provider.wallet.publicKey), // from
            //         pcsAddress, // mint
            //         await getUserTokenBagAddress(new PublicKey(receiverAddress)), // to
            //         provider.wallet.publicKey, // from's owner
            //         tokenAmount, // amount
            //         9 // decimals
            //     ),
            // );

            var transaction = new web3.Transaction().add(
                createTransferCheckedInstruction(
                    await getUserTokenBagAddress(provider.wallet.publicKey), // from
                    pcsAddress, // mint
                    await getUserTokenBagAddress(new PublicKey(receiverAddress)), // to
                    provider.wallet.publicKey, // from's owner
                    tokenAmount, // amount
                    9 // decimals
                ),
            );

            // Setting the variables for the transaction
            transaction.feePayer = await provider.wallet.publicKey;
            let blockhashObj = await connection.getRecentBlockhash();
            transaction.recentBlockhash = await blockhashObj.blockhash;

            // Transaction constructor initialized successfully
            if (transaction) {
                console.log("Txn created successfully");
            }

            // Request creator to sign the transaction (allow the transaction)
            let signed = await provider.wallet.signTransaction(transaction);
            // The signature is generated
            let signature = await connection.sendRawTransaction(signed.serialize());
            // Confirm whether the transaction went through or not
            const result = await connection.confirmTransaction(signature);

            console.log('Transaction: ', result)
        }
        catch (err) {
            console.log("Transcation error: ", err);
        }
    }

    const [receiverAddress, setReceiverAddress] = useState("");
    const [tokenAmount, setTokenAmount] = useState(0);

    useEffect(() => {
        const run = async () => {
            const provider = getProvider();
            if (!provider) {
                return;
            }



            const a = JSON.stringify(idl);
            const b = JSON.parse(a);
            const program = new Program(b, idl.metadata.address, provider);
            const account = await program.account.stakeAccount.fetch(baseAccount.publicKey);

            const endpoint = clusterApiUrl(WalletAdapterNetwork.Devnet)
            const network = endpoint;
            const connection = new Connection(network, "processed");
            const tokenAmount = parseInt((await connection.getTokenAccountBalance(await getUserTokenBagAddress(provider.wallet.publicKey))).value.amount);

            console.log("tokenAmount", tokenAmount)
            setTokenAmount(tokenAmount);
            setPcsAmount(tokenAmount);
        }
        run()

    }, [wallet]);

    interface MetaData {
        holder: any;
        pcsTokenAmount: any;
        stakeMode: any;
        stakeTime: any;
    }



    return (
        <>
            <div className="App">
                <button onClick={initialization}>Initialize</button>
                <button onClick={initializationByAccount}>InitializationByAccount</button>
                <button onClick={stake}>Stake</button>
                <button onClick={unStake}>UnStake</button>
                <button onClick={reStake}>ReStake</button>
                <button onClick={deposit}>Deposit PCS to contract by Admin</button>
                {/* <button onClick={withdraw}>Withdraw</button> */}
                <button onClick={get}>Get</button>
                <WalletMultiButton />
            </div>
            <div className="token">
                Receiver: <input type="text" value={receiverAddress} className="inputBox"
                    onChange={(e) => setReceiverAddress(e.target.value)} />
                Amount: <input type="text" value={tokenAmount} className="inputBox"
                    onChange={(e) => setTokenAmount(parseInt(e.target.value))} />
                <button onClick={send}>Send Token</button>
            </div>
            <div className="Info">
                <span>PCS Token Balance: {pcsAmount}</span>
            </div>
            <div className="detailView">
                {metaDatas.map((metadata: MetaData) => {
                    return <div className="container">
                        <span className="meta">Stake owner address: {metadata.holder.toString()}</span>
                        <span className="meta">Foundation PCS Amount: {metadata.pcsTokenAmount.toString()}</span>
                        <span className="meta">StakeMode: {metadata.stakeMode === 0 ? "Flexible" : "Blocking"}</span>
                        <span className="meta">StakeTime: {metadata.stakeTime.toString()}</span>
                    </div>
                })}
            </div>
        </>
    );
};

