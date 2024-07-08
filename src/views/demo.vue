<template>
  <div class="get-chain-address">
    <h5>请求获取biwMeta钱包的地址:</h5>
    <div>
      选择类型:
      <select v-model="selectAddressType">
        <option v-for="item in getAddressTypeArray" :key="item" :value="item">
          {{ item }}
        </option>
      </select>
    </div>
    <div v-if="selectAddressType === 'network'">
      选择链:
      <select v-model="selectChainName">
        <option v-for="chain in chainNameArray" :key="chain" :value="chain">
          {{ chain }}
        </option>
      </select>
    </div>
    <div>
      签名内容: <input type="text" v-model="signMessage">注：如不获取地址的时候顺带签名，可以不填
    </div>
    <div>
      <button @click="getBiwMetaAddress">获取地址</button>
    </div>
    <div class="chian-address-list" v-if="addressList.length">
      获取到的地址：
      <div class="chain-address">
        <div v-for="item in addressList" :key="item.chainName + item.address">
          <div>{{ item.chainName }} : {{ item.address }}</div>
          <div>publicKey: {{ item.publicKey }}</div>
          <div v-if="!!signMessage">signMessage: {{ item.signMessage }}</div>
          <div>
            <button @click="loginAddress(item)">登录该地址</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="active-address" v-if="activeAddress">
    当前登录地址
    <div>{{ activeAddress.chainName }} : {{ activeAddress.address }}</div>
    <div>publicKey: {{ activeAddress.publicKey }}</div>
    <div>
      查询当前地址的币种: <input type="text" v-model="activeAddressAssetType">
      <div>
        <p v-if="activeAddressAssetType">{{ activeAddressAssetType }}: {{ activeAddressAssetTypeBalance }}</p>
        <button @click="getAddressAssetTypeBalance">获取余额</button>
      </div>
    </div>
    <div>
      当前登录地址签名内容: <input type="text" v-model="activeAddressSignMessage">
    </div>
    <div>
      <button @click="getSignMessage">签名</button>
    </div>
    <div>
      签名结果: <span
        v-if="activeAddressSignMessage && activeAddresssignMessageRes.signMessage === activeAddressSignMessage">{{
          activeAddresssignMessageRes.res }}</span>
    </div>
  </div>

  <!-- 转账内容(根据导入地址链显示，因为有的地址密码（不符合规定的助记词）只能生成BIWMeta链地址) -->
  <div class="transfer" v-if="addressList.length">
    <!-- biw -->
    <div class="biw" v-if="hasShowChainTransfer(CHAIN_NAME.BIWMeta)">
      <h5>BIWMeta转账</h5>
      <div>发送地址: {{ getTransferSenderAddress(CHAIN_NAME.BIWMeta) }}</div>
      <div>
        接收地址:
        <div><input type="text" v-model="biwmReceiveAddress"></div>
        <small style="color: red">(注：需自己去判断地址格式)</small>
      </div>
      <div>
        币种:(不填默认主币种)
        <div><input type="text" v-model="biwmAssetType"></div>
      </div>
      <div>
        转账数量:
        <div><input type="text" v-model="biwmBalance"></div>
        <small style="color: red">(如想转1BIW,请填入100000000, 精确度8)</small>
        <div><small style="color: red">(注：正常来说是填小数格式的，这边为了方便直接使用原始值)</small></div>
      </div>
      <div>
        <button @click="biwmTransfer">签名</button>
        <div>
          返回结果：
          <textarea v-model="biwmTrs" cols="30" rows="5"></textarea>
        </div>
      </div>
    </div>
    <!-- bsc -->
    <div class="bsc" v-if="hasShowChainTransfer(CHAIN_NAME.Binance)">
      <h5>BSC转账</h5>
      <div>发送地址: {{ getTransferSenderAddress(CHAIN_NAME.Binance) }}</div>
      <div>
        接收地址:
        <div><input type="text" v-model="bscReceiveAddress"></div>
        <small style="color: red">(注：需自己去判断地址格式)</small>
      </div>
      <div>
        币种:(不填默认主币种)
        <div><input type="text" v-model="bscAssetType"></div>
        <div v-if="bscAssetType && bscAssetType !== 'BNB'">
          对应合约地址：<input type="text" v-model="bscContractAddress">
        </div>
        <div v-if="bscAssetType && bscAssetType !== 'BNB'">
          对应精确度：<input type="number" v-model="bscContractDecimals">
        </div>
      </div>
      <div>
        转账数量:
        <div><input type="text" v-model="bscBalance"></div>
        <small style="color: red">(如想转1BIW,请填入100000000, 精确度8)</small>
        <div><small style="color: red">(注：正常来说是填小数格式的，这边为了方便直接使用原始值)</small></div>
      </div>
      <div>
        <button @click="bscTransfer">签名</button>
        <div>
          返回结果：
          <textarea v-model="bscTrs" cols="30" rows="5"></textarea>
        </div>
      </div>
    </div>
    <!-- eth -->
    <div class="eth" v-if="hasShowChainTransfer(CHAIN_NAME.Ethereum)">
      <h5>ETH转账</h5>
      <div>发送地址: {{ getTransferSenderAddress(CHAIN_NAME.Ethereum) }}</div>
      <div>
        接收地址:
        <div><input type="text" v-model="ethReceiveAddress"></div>
        <small style="color: red">(注：需自己去判断地址格式)</small>
      </div>
      <div>
        币种:(不填默认主币种)
        <div><input type="text" v-model="ethAssetType"></div>
        <div v-if="ethAssetType && ethAssetType !== 'ETH'">
          对应合约地址：<input type="text" v-model="ethContractAddress">
        </div>
        <div v-if="ethAssetType && ethAssetType !== 'ETH'">
          对应精确度：<input type="number" v-model="ethContractDecimals">
        </div>
      </div>
      <div>
        转账数量:
        <div><input type="text" v-model="ethBalance"></div>
        <small style="color: red">(如想转1BIW,请填入100000000, 精确度8)</small>
        <div><small style="color: red">(注：正常来说是填小数格式的，这边为了方便直接使用原始值)</small></div>
      </div>
      <div>
        <button @click="ethTransfer">签名</button>
        <div>
          返回结果：
          <textarea v-model="ethTrs" cols="30" rows="5"></textarea>
        </div>
      </div>
    </div>
    <!-- tron -->
    <div class="tron" v-if="hasShowChainTransfer(CHAIN_NAME.Tron)">
      <h5>TRON转账</h5>
      <div>发送地址: {{ getTransferSenderAddress(CHAIN_NAME.Tron) }}</div>
      <div>
        接收地址:
        <div><input type="text" v-model="tronReceiveAddress"></div>
        <small style="color: red">(注：需自己去判断地址格式)</small>
      </div>
      <div>
        币种:(不填默认主币种)
        <div><input type="text" v-model="tronAssetType"></div>
        <div v-if="tronAssetType && tronAssetType !== 'ETH'">
          对应合约地址：<input type="text" v-model="tronContractAddress">
        </div>
        <div v-if="tronAssetType && tronAssetType !== 'ETH'">
          对应精确度：<input type="number" v-model="tronContractDecimals">
        </div>
      </div>
      <div>
        转账数量:
        <div><input type="text" v-model="tronBalance"></div>
        <small style="color: red">(如想转1BIW,请填入100000000, 精确度8)</small>
        <div><small style="color: red">(注：正常来说是填小数格式的，这边为了方便直接使用原始值)</small></div>
      </div>
      <div>
        <button @click="tronTransfer">签名</button>
        <div>
          返回结果：
          <textarea v-model="tronTrs" cols="30" rows="5"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { $WALLET_AUTHORIZE_ADDRESS_TYPE, $WALLET_PLAOC_PATH, $WALLET_SIGNATURE_TYPE, CHAIN_NAME, type $WEALLET_ADDRESS_RESPONSE } from '@/services/biwmeta/types';
import biwMetaService from '@/services/biwmeta';
console.log(import.meta.env.VITE_BIW_META_ID);
const getAddressTypeArray = Object.values($WALLET_AUTHORIZE_ADDRESS_TYPE);
const chainNameArray = Object.values(CHAIN_NAME);

let selectAddressType = ref($WALLET_AUTHORIZE_ADDRESS_TYPE.main);
let selectChainName = ref(CHAIN_NAME.BIWMeta);
let signMessage = ref('');

let addressList = ref([] as Array<$WEALLET_ADDRESS_RESPONSE>);

/** 登录的地址 */
let activeAddress = ref(null as $WEALLET_ADDRESS_RESPONSE | null);
let activeAddressSignMessage = ref('');
let activeAddresssignMessageRes = ref({
  signMessage: "",
  res: "",
});
/** 获取地址 */
const getBiwMetaAddress = async () => {
  /// 看一下有没装应用
  const hasId = await biwMetaService.canOpenId(import.meta.env.VITE_BIW_META_ID);
  if (!hasId) {
    alert(`未安装BIW Meta(${import.meta.env.VITE_BIW_META_ID})`);
    return;
  }
  const res = await biwMetaService.getBIWMetaAppData(
    import.meta.env.VITE_BIW_META_ID,
    $WALLET_PLAOC_PATH.getAddress,
    {
      type: selectAddressType.value,
      chainName: selectChainName.value,
      signMessage: JSON.stringify(signMessage.value),
    }
  );
  const data = await res.getData();
  /// 得到数据，聚焦本窗口才行
  await biwMetaService.focusWindow();
  if (data) {
    addressList.value = data;
    activeAddress.value = null;
    return;
  }
  alert("授权失败")
}
/** 签名 */
const getSignMessage = async () => {
  if (!activeAddress.value) {
    alert("未登录地址")
    return;
  }
  /// 看一下有没装应用
  const hasId = await biwMetaService.canOpenId(import.meta.env.VITE_BIW_META_ID);
  if (!hasId) {
    alert(`未安装BIW Meta(${import.meta.env.VITE_BIW_META_ID})`);
    return;
  }
  const res = await biwMetaService.getBIWMetaAppData(
    import.meta.env.VITE_BIW_META_ID,
    $WALLET_PLAOC_PATH.signature,
    [{
      type: $WALLET_SIGNATURE_TYPE.message,
      chainName: activeAddress.value.chainName,
      senderAddress: activeAddress.value.address,
      message: activeAddressSignMessage.value,
    }]
  );
  const data = await res.getData();
  /// 得到数据，聚焦本窗口才行
  await biwMetaService.focusWindow();
  if (data) {
    const resSign = data[0];/// 因为调用的时候，只传入一个长度的数组，返回结果就是对应的索引
    if (resSign) {
      activeAddresssignMessageRes.value.signMessage = activeAddressSignMessage.value;
      activeAddresssignMessageRes.value.res = resSign as string;
      return;
    }
    alert("签名失败");
    return;
  }
  alert("取消签名")
}

/** 登录地址 */
const loginAddress = (item: $WEALLET_ADDRESS_RESPONSE) => {
  activeAddress.value = item;
}


let activeAddressAssetType = ref('');
let activeAddressAssetTypeBalance = ref('');
/** 获取地址对应币种余额 */
const getAddressAssetTypeBalance = async () => {
  if (!activeAddress.value) {
    alert("未登录地址")
    return;
  }
  /// 看一下有没装应用
  const hasId = await biwMetaService.canOpenId(import.meta.env.VITE_BIW_META_ID);
  if (!hasId) {
    alert(`未安装BIW Meta(${import.meta.env.VITE_BIW_META_ID})`);
    return;
  }
  if (!activeAddressAssetType.value) {
    alert(`请输入查询的币种`);
    return;
  }
  const res = await biwMetaService.getBIWMetaAppData(
    import.meta.env.VITE_BIW_META_ID,
    $WALLET_PLAOC_PATH.signature,
    [{
      type: $WALLET_SIGNATURE_TYPE.assetTypeBalance,
      chainName: activeAddress.value.chainName,
      senderAddress: activeAddress.value.address,
      assetTypes: [{
        assetType: activeAddressAssetType.value, /// 币种
      }],
    }]
  );
  const data = await res.getData();
  /// 得到数据，聚焦本窗口才行
  await biwMetaService.focusWindow();
  if (data) {
    const res = data[0];
    if (res) {
      const assetTypeInfo = (data[0] as {
        [assetType: string]: {
          assetType: string,// 币种
          decimals: number,// 精度，用于页面展示转化，便于阅读
          balance: string,// 余额
          contracts?: string,// 合约
        } | undefined;
      })[activeAddressAssetType.value];
      activeAddressAssetTypeBalance.value = assetTypeInfo?.balance || '';
    } else {
      activeAddressAssetTypeBalance.value = '';
    }
    return;
  }
  alert("授权失败")
}

// #region 转账内容

let biwmReceiveAddress = ref('');
let biwmAssetType = ref('');
let biwmBalance = ref('');
let biwmTrs = ref('');

let bscReceiveAddress = ref('');
let bscAssetType = ref('');
let bscBalance = ref('');
let bscTrs = ref('');
let bscContractAddress = ref('');
let bscContractDecimals = ref(0);

let ethReceiveAddress = ref('');
let ethAssetType = ref('');
let ethBalance = ref('');
let ethTrs = ref('');
let ethContractAddress = ref('');
let ethContractDecimals = ref(0);

let tronReceiveAddress = ref('');
let tronAssetType = ref('');
let tronBalance = ref('');
let tronTrs = ref('');
let tronContractAddress = ref('');
let tronContractDecimals = ref(0);

/** 显示本次导入的钱包所支持的链的转账(用于demo展示用) */
const hasShowChainTransfer = (chainName: CHAIN_NAME) => {
  return addressList.value.find(item => item.chainName === chainName);
}

/** 显示转账的发送地址(用于demo展示用) */
const getTransferSenderAddress = (chainName: CHAIN_NAME) => {
  return addressList.value.find(item => item.chainName === chainName)!.address;
}

/** biwm转账 */
const biwmTransfer = async () => {
  /// 看一下有没装应用
  const hasId = await biwMetaService.canOpenId(import.meta.env.VITE_BIW_META_ID);
  if (!hasId) {
    alert(`未安装BIW Meta(${import.meta.env.VITE_BIW_META_ID})`);
    return;
  }
  /// 不可以自己转自己
  const senderAddress = getTransferSenderAddress(CHAIN_NAME.BIWMeta);
  const receiveAddress = biwmReceiveAddress.value;
  const assetType = biwmAssetType.value;
  const balance = biwmBalance.value;
  if (!receiveAddress) {
    alert(`请输入biwm接收地址`);
    return;
  }
  if (senderAddress === receiveAddress) {
    alert(`不可自己转自己`);
    return;
  }
  if (isNaN(+balance)) {
    alert(`biwm 转账数量格式不正确`);
    return;
  }
  if (+balance <= 0) {
    alert(`biwm 转账数量必须大于0`);
    return;
  }

  const res = await biwMetaService.getBIWMetaAppData(
    import.meta.env.VITE_BIW_META_ID,
    $WALLET_PLAOC_PATH.signature,
    [{
      type: $WALLET_SIGNATURE_TYPE.transfer,
      chainName: CHAIN_NAME.BIWMeta,
      senderAddress,
      receiveAddress,
      balance,
    }]
  );
  const data = await res.getData();
  /// 得到数据，聚焦本窗口才行
  await biwMetaService.focusWindow();
  if (data) {
    biwmTrs.value = JSON.stringify(data[0]);
    return;
  }
  alert("授权失败")
}
/** bsc转账 */
const bscTransfer = async () => {
  /// 看一下有没装应用
  const hasId = await biwMetaService.canOpenId(import.meta.env.VITE_BIW_META_ID);
  if (!hasId) {
    alert(`未安装BIW Meta(${import.meta.env.VITE_BIW_META_ID})`);
    return;
  }
  /// 不可以自己转自己
  const senderAddress = getTransferSenderAddress(CHAIN_NAME.Binance);
  const receiveAddress = bscReceiveAddress.value;
  const assetType = bscAssetType.value;
  const balance = bscBalance.value;

  const contractAddress = bscContractAddress.value;
  const decimals = bscContractDecimals.value;

  if (!receiveAddress) {
    alert(`请输入bsc接收地址`);
    return;
  }
  if (senderAddress === receiveAddress) {
    alert(`不可自己转自己`);
    return;
  }
  if (assetType && assetType !== 'BNB' && !contractAddress) {
    alert(`请输入bsc 合约地址`);
    return;
  }

  if (assetType && assetType !== 'BNB' && !decimals) {
    alert(`请输入bsc 合约精确度`);
    return;
  }
  if (isNaN(+decimals)) {
    alert(`bsc 合约精确度格式不正确`);
    return;
  }
  if (+decimals <= 0) {
    alert(`bsc 合约精确度必须大于0`);
    return;
  }


  if (isNaN(+balance)) {
    alert(`bsc 转账数量格式不正确`);
    return;
  }
  if (+balance <= 0) {
    alert(`bsc 转账数量必须大于0`);
    return;
  }

  const contractInfo = !assetType || assetType === 'BNB' ? undefined : {
    contractAddress, // 合约地址
    assetType, // 币种
    decimals, // 对应的精确度
  }

  const res = await biwMetaService.getBIWMetaAppData(
    import.meta.env.VITE_BIW_META_ID,
    $WALLET_PLAOC_PATH.signature,
    [{
      type: $WALLET_SIGNATURE_TYPE.transfer,
      chainName: CHAIN_NAME.Binance,
      senderAddress,
      receiveAddress,
      balance,
      contractInfo,
    }]
  );
  const data = await res.getData();
  /// 得到数据，聚焦本窗口才行
  await biwMetaService.focusWindow();
  if (data) {
    bscTrs.value = JSON.stringify(data[0]);
    return;
  }
  alert("授权失败")
}
/** eth转账 */
const ethTransfer = async () => {
  /// 看一下有没装应用
  const hasId = await biwMetaService.canOpenId(import.meta.env.VITE_BIW_META_ID);
  if (!hasId) {
    alert(`未安装BIW Meta(${import.meta.env.VITE_BIW_META_ID})`);
    return;
  }
  /// 不可以自己转自己
  const senderAddress = getTransferSenderAddress(CHAIN_NAME.Ethereum);
  const receiveAddress = ethReceiveAddress.value;
  const assetType = ethAssetType.value;
  const balance = ethBalance.value;

  const contractAddress = ethContractAddress.value;
  const decimals = ethContractDecimals.value;

  if (!receiveAddress) {
    alert(`请输入eth接收地址`);
    return;
  }
  if (senderAddress === receiveAddress) {
    alert(`不可自己转自己`);
    return;
  }
  if (assetType && assetType !== 'ETH' && !contractAddress) {
    alert(`请输入eth 合约地址`);
    return;
  }

  if (assetType && assetType !== 'ETH' && !decimals) {
    alert(`请输入eth 合约精确度`);
    return;
  }
  if (isNaN(+decimals)) {
    alert(`eth 合约精确度格式不正确`);
    return;
  }
  if (+decimals <= 0) {
    alert(`eth 合约精确度必须大于0`);
    return;
  }


  if (isNaN(+balance)) {
    alert(`eth 转账数量格式不正确`);
    return;
  }
  if (+balance <= 0) {
    alert(`eth 转账数量必须大于0`);
    return;
  }

  const contractInfo = !assetType || assetType === 'ETH' ? undefined : {
    contractAddress, // 合约地址
    assetType, // 币种
    decimals, // 对应的精确度
  }

  const res = await biwMetaService.getBIWMetaAppData(
    import.meta.env.VITE_BIW_META_ID,
    $WALLET_PLAOC_PATH.signature,
    [{
      type: $WALLET_SIGNATURE_TYPE.transfer,
      chainName: CHAIN_NAME.Ethereum,
      senderAddress,
      receiveAddress,
      balance,
      contractInfo,
    }]
  );
  const data = await res.getData();
  /// 得到数据，聚焦本窗口才行
  await biwMetaService.focusWindow();
  if (data) {
    ethTrs.value = JSON.stringify(data[0]);
    return;
  }
  alert("授权失败")
}
/** tron转账 */
const tronTransfer = async () => {
  /// 看一下有没装应用
  const hasId = await biwMetaService.canOpenId(import.meta.env.VITE_BIW_META_ID);
  if (!hasId) {
    alert(`未安装BIW Meta(${import.meta.env.VITE_BIW_META_ID})`);
    return;
  }
  /// 不可以自己转自己
  const senderAddress = getTransferSenderAddress(CHAIN_NAME.Tron);
  const receiveAddress = tronReceiveAddress.value;
  const assetType = tronAssetType.value;
  const balance = tronBalance.value;

  const contractAddress = tronContractAddress.value;
  const decimals = tronContractDecimals.value;

  if (!receiveAddress) {
    alert(`请输入tron接收地址`);
    return;
  }
  if (senderAddress === receiveAddress) {
    alert(`不可自己转自己`);
    return;
  }
  if (assetType && assetType !== 'TRX' && !contractAddress) {
    alert(`请输入tron 合约地址`);
    return;
  }

  if (assetType && assetType !== 'TRX' && !decimals) {
    alert(`请输入tron 合约精确度`);
    return;
  }
  if (isNaN(+decimals)) {
    alert(`tron 合约精确度格式不正确`);
    return;
  }
  if (+decimals <= 0) {
    alert(`tron 合约精确度必须大于0`);
    return;
  }


  if (isNaN(+balance)) {
    alert(`tron 转账数量格式不正确`);
    return;
  }
  if (+balance <= 0) {
    alert(`tron 转账数量必须大于0`);
    return;
  }

  const contractInfo = !assetType || assetType === 'TRX' ? undefined : {
    contractAddress, // 合约地址
    assetType, // 币种
    decimals, // 对应的精确度
  }

  const res = await biwMetaService.getBIWMetaAppData(
    import.meta.env.VITE_BIW_META_ID,
    $WALLET_PLAOC_PATH.signature,
    [{
      type: $WALLET_SIGNATURE_TYPE.transfer,
      chainName: CHAIN_NAME.Tron,
      senderAddress,
      receiveAddress,
      balance,
      contractInfo,
    }]
  );
  const data = await res.getData();
  /// 得到数据，聚焦本窗口才行
  await biwMetaService.focusWindow();
  if (data) {
    tronTrs.value = JSON.stringify(data[0]);
    return;
  }
  alert("授权失败")
}
// #endregion
</script>

<style>
div {
  overflow-wrap: break-word;
}

.get-chain-address {
  border: 1px solid salmon;
}

.chian-address-list {
  padding: 12px;
  width: 90%;
  margin: auto;
  margin-top: 8px;
  margin-bottom: 8px;
  border: 1px solid forestgreen;
  height: 200px;
  overflow: scroll;

}

.chain-address {
  font-size: 14px;
}

.transfer>div {
  margin-bottom: 10px;
  margin-top: 10px;
  border: 1px solid darkgoldenrod;
  padding: 4px 12px;
}

.transfer div>h5 {
  color: darkmagenta;
}
</style>
