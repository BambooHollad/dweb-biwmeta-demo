/** 钱包调用 api path */
export enum $WALLET_PLAOC_PATH {
    /** 获取地址 */
    getAddress = '/wallet/authorize/address',
    /** 签名 */
    signature = '/wallet/authorize/signature',
}

/** 钱包内的链 */
export enum CHAIN_NAME {
    /// 统称内链
    BIWMETA = 'BIWMeta',
    /// 以下统称叫外链
    Binance = 'Binance',
    Tron = 'Tron',
    Ethereum = 'Ethereum',
    Bitcoin = 'Bitcoin',
}

/** 获取地址的类型 */
export enum $WALLET_AUTHORIZE_ADDRESS_TYPE {
    /** 获取一个身份下的所有地址 */
    main = 'main',
    /** 获取钱包内的 某条链的所有地址 */
    network = 'network',
    /** 获取钱包所有地址 */
    all = 'all',
}

/** 地址返回 */
export type $WEALLET_ADDRESS_RESPONSE = {
    name: string, // 钱包名称，基本用不到可忽略
    chainName: CHAIN_NAME, // 对应该地址的链，需要存下
    address: string, // 对应地址，需要存下
    publicKey: string, // 地址对应的公钥，需要存下
    magic: string, // BIW链的magic标识符，外链没有，需要存下，主要用于通过区块链浏览器
    signMessage?: string, // 如果授权的时候传入signMessage，则返回对应签名好的signMessage
};

/** 签名类型（不要调整里面顺序） */
export enum $WALLET_SIGNATURE_TYPE {
    /** 消息签名 */
    message,
    /** 转账 */
    transfer,
    /** 凭证资产转移 */
    bioforestChainCertificateTransfer,
    /** json签名 */
    json,
    /** 同质化 */
    ENTITY,
    /** 获取币种余额 */
    assetTypeBalance,
}

/** 钱包签名文本 */
export type $WALLET_SIGNATURE_MESSAGE = {
    type: $WALLET_SIGNATURE_TYPE.message,
    chainName: CHAIN_NAME,
    senderAddress: string,
    message: string,
}

/** 获取地址对应币种余额 */
export type $WALLET_ASSETTYPE_BALANCE = {
    type: $WALLET_SIGNATURE_TYPE.assetTypeBalance,
    chainName: CHAIN_NAME,
    senderAddress: string,
    assetTypes: Array<{
        assetType: string, /// 币种
        contractAddress?: string, /// 合约仅用于 binance eth tron
    }>;
}

/** 签名传参类型:(目前仅需要签名文本) */
export type $WALLET_SIGNATURE_PARAMETER = $WALLET_SIGNATURE_MESSAGE | $WALLET_ASSETTYPE_BALANCE;

/** 签名返回类型:(目前仅需要签名文本) */
export type $WEALLET_SIGNATURE_RESPONSE =
    /**签名后的字符串 */
    | string
    /** 获取资产余额 */
    | {
        [assetType: string]: {
            assetType: string,// 币种
            decimals: number,// 精度，用于页面展示转化，便于阅读
            balance: string,// 余额
            contracts?: string,// 合约
        } | undefined;
    };

/** 钱包调用传参 */
export type $WALLET_PLAOC_PATH_REQUEST_PARAMETER = {
    /** 获取地址，如果不填钱包那边默认 main */
    [$WALLET_PLAOC_PATH.getAddress]:
    | undefined
    | {
        type: $WALLET_AUTHORIZE_ADDRESS_TYPE,
        chainName?: CHAIN_NAME, //  $WALLET_AUTHORIZE_ADDRESS_TYPE.all | $WALLET_AUTHORIZE_ADDRESS_TYPE.main,
        signMessage?: string, // 在获取地址的时候，顺带签名字符串，目前场景是用于获取身份token，避免获取地址之后又要签名一次，避免无效操作
    };

    /** 签名，目前支持最大3个！ */
    [$WALLET_PLAOC_PATH.signature]: Array<$WALLET_SIGNATURE_PARAMETER>;
}

/** 钱包调用返回
 * 
 * ！！！特别注意：返回null，说明用户点了拒绝，但是如果用户将程序最小化之类的，调用端是收不到返回信息的
 * 类似（用饿了么支付的时候，调整到支付宝，直接将支付宝进程杀了）
 */
export type $WALLET_PLAOC_PATH_RESPONSE = {
    /** 获取地址 */
    [$WALLET_PLAOC_PATH.getAddress]: Array<$WEALLET_ADDRESS_RESPONSE> | null;


    /** 签名
     * 这边内部的null是对应签名哪个过不去返回null，如调用[(1)，(2)] -> [null, (xxx)]，说明签名1失败 2成功
     * 外面的null是用户点了拒绝，如调用[(1)，(2)] -> null，用户拒绝
     */
    [$WALLET_PLAOC_PATH.signature]: Array<$WEALLET_SIGNATURE_RESPONSE | null> | null;


}