<template>
  <nav-menu-button id="test" icon="loyalty" @nav-click="openNav">Test</nav-menu-button>
</template>
 <script>
'use strict';
const navMenuButton = window.kiln.utils.components.navMenuButton;

module.exports = {
  data() {
    return {};
  },
  methods: {
    openNav() {
      this.$store.dispatch('toggleDrawer', 'test');
    }
  },
  components: {
    navMenuButton
  }
};
</script>
