<template>
    <div>
        <h2>
            Dashboard
        </h2>
    </div>
</template>

<script>
export default {
      middleware: 'authenticated',
      mounted() {
          this.$store.dispatch('getDevices')
      }
}
</script>