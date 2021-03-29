<template>
<div>
    <div class="row" v-if="$store.state.selectedDevice.template !== undefined">
        <div
          v-for="(widget, index) of $store.state.selectedDevice.template
            .widgets"
          :key="index"
          :class="[widget.column]"
        >
        <Json :value="fixWidget(widget)"/>
          <Rtnumberchart
            v-if="widget.widget == 'numberchart'"
            :config="fixWidget(widget)"
          ></Rtnumberchart>

          <Iotswitch
            v-if="widget.widget == 'switch'"
            :config="fixWidget(widget)"
          ></Iotswitch>

          <Iotbutton
            v-if="widget.widget == 'button'"
            :config="fixWidget(widget)"
          ></Iotbutton>

          <Iotindicator
            v-if="widget.widget == 'indicator'"
            :config="fixWidget(widget)"
          ></Iotindicator>
        </div>
      
    </div>
    <div v-else class="mx-5">You dont have templates</div>
    </div>
</template>

<script>
export default {
  middleware: "authenticated",
  mounted() {
    this.$store.dispatch("getDevices");
  },
  methods: {
    fixWidget(widget){
      let widgetCopy = JSON.parse(JSON.stringify(widget))
      widgetCopy.selectedDevice.dId = this.$store.state.selectedDevice.dId
      widgetCopy.selectedDevice.name = this.$store.state.selectedDevice.name
      widgetCopy.userId = this.$store.state.selectedDevice.userId
      return widgetCopy;
    }
  }
};
</script>