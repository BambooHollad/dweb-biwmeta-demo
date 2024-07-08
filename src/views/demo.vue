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
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { $WALLET_AUTHORIZE_ADDRESS_TYPE, $WALLET_PLAOC_PATH, $WALLET_SIGNATURE_TYPE, CHAIN_NAME, type $WEALLET_ADDRESS_RESPONSE } from '@/services/biwmeta/types';
import biwMetaService from '@/services/biwmeta';
console.log(import.meta.env.VITE_BIW_META_ID);
const getAddressTypeArray = Object.values($WALLET_AUTHORIZE_ADDRESS_TYPE);
const chainNameArray = Object.values(CHAIN_NAME);

let selectAddressType = ref($WALLET_AUTHORIZE_ADDRESS_TYPE.main);
let selectChainName = ref(CHAIN_NAME.BIWMETA);
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
  debugger
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
</script>

<style>
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
</style>
