import { getSrp, getRandomSrpVerifier } from '@proton/srp';

import { getInfo, getModulus } from './api/auth';
import { Api } from './interfaces';
import { InfoResponse, ModulusResponse } from './authentication/interface';
const rfc5054 = {
    N_base10: "21766174458617435773191008891802753781907668374255538511144643224689886235383840957210909013086056401571399717235807266581649606472148410291413364152197364477180887395655483738115072677402235101762521901569820740293149529620419333266262073471054548368736039519702486226506248861060256971802984953561121442680157668000761429988222457090413873973970171927093992114751765168063614761119615476233422096442783117971236371647333871414335895773474667308967050807005509320424799678417036867928316761272274230314067548291133582479583061439577559347101961771406173684378522703483495337037655006751328447510550299250924469288819",
    g_base10: "2",
    k_base16: "5b9e8ef059c6b32ea59fc1d322d37f04aa30bae5aa9003b8321e21ddb04e300"
  }
  // generate the client session class from the client session factory closure
  const SRP6JavascriptClientSession = require('thinbus-srp/client.js')(rfc5054.N_base10, rfc5054.g_base10, rfc5054.k_base16);
  const client = new SRP6JavascriptClientSession();

interface Credentials {
    username?: string;
    password: string;
    totp?: string;
}

interface SrpAuthData {
    ClientProof: string;
    ClientEphemeral: string;
    TwoFactorCode?: string;
    SRPSession: string;
}

interface Config {
    [key: string]: any;
}

/**
 * Call the API with the SRP parameters and validate the server proof.
 */
interface CallAndValidateArguments {
    api: Api;
    config: Config;
    authData: SrpAuthData;
    expectedServerProof: string;
}
const callAndValidate = async <T>({
    api,
    config: { data, ...restConfig },
    authData,
    expectedServerProof,
}: CallAndValidateArguments) => {
    const result = await api<T & { ServerProof: string }>({
        ...restConfig,
        data: {
            ...authData,
            ...data,
        },
    });
    const { ServerProof } = result;



    // if (ServerProof !== expectedServerProof) {
    //     throw new Error('Unexpected server proof');
    // }

    try {
        client.step3(ServerProof);
        } catch (error) {
            throw new Error('Unexpected server proof');
        }

    return result;
};

/**
 * Perform an API call with SRP auth.
 */
interface SrpAuthArguments {
    api: Api;
    credentials: Credentials;
    config: Config;
    info?: InfoResponse;
    version?: number;
}
export const srpAuth = async <T>({ api, credentials, config, info, version }: SrpAuthArguments) => {
    const actualInfo = info || (await api<InfoResponse>(getInfo(credentials.username)));
    const { expectedServerProof, clientProof, clientEphemeral } = await getSrp(actualInfo, credentials, version);
    const authData = {
        ClientProof: clientProof,
        ClientEphemeral: clientEphemeral,
        TwoFactorCode: credentials.totp,
        SRPSession: actualInfo.SRPSession,
    };
    return callAndValidate<T>({
        api,
        config,
        authData,
        expectedServerProof,
    });
};

/**
 * Get initialization parameters for SRP.
 */
export const srpGetVerify = async ({ api, credentials }: { api: Api; credentials: Credentials }) => {
    const data = await api<ModulusResponse>(getModulus());
    const { version, salt, verifier } = await getRandomSrpVerifier(data, credentials);
    const authData = {
        ModulusID: data.ModulusID,
        Version: version,
        Salt: salt,
        Verifier: verifier,
    };
    return {
        Auth: authData,
    };
};

/**
 * Perform an SRP call with the random verifier.
 */
export const srpVerify = async <T>({
    api,
    credentials,
    config: { data, ...restConfig },
}: {
    api: Api;
    credentials: Credentials;
    config: Config;
}) => {
    const authData = await srpGetVerify({ api, credentials });
    return api<T>({
        ...restConfig,
        data: {
            ...data,
            ...authData,
        },
    });
};
