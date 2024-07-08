<script setup lang="ts">
import { RouterView } from 'vue-router'
const APP_BASE = import.meta.env.VITE_BIW_META_ID;
</script>

<template>
  <h3>{{ APP_BASE }}</h3>
  <RouterView />
</template>

<style scoped></style>
