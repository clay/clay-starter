<template>
  <button @click="updateParagraph">Press Me</button>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  methods: {
    updateParagraph() {
      // trigger a save of a paragraph that appears on the page and see what happens to the paragraph on the page.  does it update on its own?
      this.$store.dispatch('saveComponent', { uri: 'localhost/_components/paragraph/instances/cjue4dl7i00062a65rpexptmp', data: { text: 'This is Some Text!' + Date.now(), componentVariation: 'paragraph'}});
    }
  }
}
</script>
