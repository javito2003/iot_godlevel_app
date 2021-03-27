<template>
  <div>
    <!-- FORM ADD DEVICE -->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">Add new Device</h4>
        </div>

        <div class="row">
          <div class="col-4">
            <base-input
              label="Device Name"
              type="text"
              placeholder="Ex: Home, Office..."
              v-model="newDevice.name"
            >
            </base-input>
          </div>

          <div class="col-4">
            <base-input
              label="Device Id"
              type="text"
              placeholder="Ex: 7777-8888"
              v-model="newDevice.dId"
            >
            </base-input>
          </div>

          <div class="col-4">
            <slot name="label">
              <label> Template </label>
            </slot>

            <el-select
              v-model="selectedIndexTemplate"
              placeholder="Select Template"
              class="select-primary"
              style="width: 100%"
            >
              <el-option
                v-for="(item, index) in templates" :key="index"
                class="text-dark"
                :value="index"
                :label="item.name"
              ></el-option>
            </el-select>
          </div>
        </div>

        <div class="row pull-right">
          <div class="col-12">
            <base-button type="primary" @click="createNewDevice()" class="mb-3" size="lg">Add</base-button>
          </div>
        </div>
      </card>
    </div>

    <!-- DEVICES TABLE -->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">Devices</h4>
        </div>

        <el-table :data="$store.state.devices">
          <el-table-column label="#" min-width="50" align="center">
            <div slot-scope="{ row, $index }">
              {{ $index + 1 }}
            </div>
          </el-table-column>

          <el-table-column prop="name" label="Name"></el-table-column>

          <el-table-column prop="dId" label="Device Id"></el-table-column>

          <el-table-column
            prop="templateName"
            label="Template"
          ></el-table-column>

          <el-table-column label="Actions">
            <div slot-scope="{ row, $index }">
              <el-tooltip content="Saver Status" style="margin-right: 10px">
                <i
                  class="fas fa-database"
                  :class="{
                    'text-success': row.saverRule.status,
                    'text-dark': !row.saverRule.status,
                  }"
                ></i>
              </el-tooltip>

              <el-tooltip content="Database Saver">
                <base-switch
                  @click="updateSaverRuleStatus(row.saverRule)"
                  :value="row.saverRule.status"
                  type="primary"
                  on-text="On"
                  off-text="Off"
                ></base-switch>
              </el-tooltip>

              <el-tooltip
                content="Delete"
                effect="light"
                :open-delay="300"
                placement="top"
              >
                <base-button
                  type="danger"
                  icon
                  size="sm"
                  class="btn-link"
                  @click="deleteDevice(row)"
                >
                  <i class="tim-icons icon-simple-remove"></i>
                </base-button>
              </el-tooltip>
            </div>
          </el-table-column>
        </el-table>
      </card>
    </div>
    <Json :value="$store.state.selectedDevice"/>
    <Json :value="$store.state.devices"/>
  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
import { Select, Option } from "element-ui";

export default {
  middleware: "authenticated",
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select,
  },
  data() {
    return {
      templates: [],
      selectedIndexTemplate: null,
      newDevice: {
        name: "",
        dId: '',
        templateId: '',
        templateName: '',
      }
    }
  },
  mounted() {

    this.getTemplates()
  },
  methods: {
    createNewDevice(){
      if(this.newDevice.name == ''){
        this.$notify({
          type: 'warning',
          icon: 'tim-icons icon-alert-circle-exc',
          message: 'Device name is empty'
        })
        return
      }
      if(this.newDevice.dId == ''){
        this.$notify({
          type: 'warning',
          icon: 'tim-icons icon-alert-circle-exc',
          message: "Device ID is empty"
        })
        return
      }

      if(this.selectedIndexTemplate == null){
        this.$notify({
          type: 'warning',
          icon: 'tim-icons icon-alert-circle-exc',
          message: "Template is empty"
        })
        return
      }


      let config = {
        headers: {
          token: this.$store.state.auth.token,
        }
      }
      //We write the name and the templateID selected in the object
      this.newDevice.templateId = this.templates[this.selectedIndexTemplate]._id
      this.newDevice.templateName = this.templates[this.selectedIndexTemplate].name

      const toSend = {
        newDevice : this.newDevice
      }
      this.$axios.post('/new-device', toSend, config)
      .then(res => {
        if(res.data.status == 'success') {

          this.$notify({
            type: 'success',
            icon: "tim-icons icon-check-2",
            message: "Success! Device was added"
          })
          this.$store.dispatch('getDevices')
          return
        }
      })
      .catch(err => {
        if(err.response.data.success == false && err.response.data.error == 'Device validation failed: dId: Error, device already exists'){
          this.$notify({
            type: 'warning',
            icon: "tim-icons icon-alert-circle-exc",
            message: "The device is already registered in the system. Try another device Id"
          })
        }else{
          this.$notify({
            type: "warning",
            icon: 'tim-icons icon-alert-circle-exc',
            message: "Erro to cread a new device"
          })
        }
      })
    },
    deleteDevice(device) {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          dId: device.dId,
        },
      };

      this.$axios
        .delete("/device", config)
        .then((res) => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: device.name + " deleted!",
            });

            this.$store.dispatch("getDevices");
          }
          return;
        })
        .catch((err) => {
          console.log(err.response);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Error deleting " + device.name,
          });
          return;
        });
    },
        updateSaverRuleStatus(rule) {
      var ruleCopy = JSON.parse(JSON.stringify(rule));

      ruleCopy.status = !ruleCopy.status;
      const toSend = { rule: ruleCopy };
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };

      this.$axios.put("saver-rule", toSend, axiosHeaders).then((res) => {
        if (res.data.status == "success") {
          this.$store.dispatch("getDevices");
          this.$notify({
            type: "success",
            icon: "tim-icons icon-check-2",
            message: "Device saver status successfully",
          });
        }
        return
      })
      .catch((err) => {
        console.log(err.response);
        this.$notify({
          type: "danger",
          icon: "tim-icons icon-alert-circle",
          message: "Error to update rule"
        })
        return
      })
    },
    getTemplates() {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      this.$axios
        .get("/templates", config)
        .then((res) => {
          this.templates = res.data.data;
        })
        .catch((err) => {
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Error to get templates",
          });
        });
    },
  },
};
</script>
