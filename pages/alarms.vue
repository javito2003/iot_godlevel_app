<template>
  <div>
    <!-- NEW ALARM FORM -->
    <div class="row">
      <div class="col-sm-12">
        <card v-if="$store.state.devices.length > 0">
          <div slot="header">
            <h4 class="card-title">
              Create new Alarm Rule {{ selectedWidgetIndex }}
            </h4>
          </div>

          <div class="row">
            <div class="col-3">
              <el-select
                required
                class="select-success"
                placeholder="Variable"
                v-model="selectedWidgetIndex"
                style="margin-top: 25px"
              >
                <el-option
                  v-for="(widget, index) in $store.state.selectedDevice.template
                    .widgets"
                  :key="index"
                  class="text-dark"
                  :value="index"
                  :label="widget.variableFullName"
                ></el-option>
              </el-select>
            </div>

            <div class="col-3">
              <el-select
                required
                class="select-warning"
                placeholder="Condition"
                v-model="newRule.condition"
                style="margin-top: 25px"
              >
                <el-option class="text-dark" value="=" label="="></el-option>
                <el-option class="text-dark" value=">" label=">"></el-option>
                <el-option class="text-dark" value=">=" label=">="></el-option>
                <el-option class="text-dark" value="<" label="<"></el-option>
                <el-option class="text-dark" value="<=" label="<="></el-option>
                <el-option class="text-dark" value="!=" label="!="></el-option>
              </el-select>
            </div>

            <div class="col-3">
              <base-input
                label="Value"
                v-model="newRule.value"
                type="number"
              ></base-input>
            </div>

            <div class="col-3">
              <base-input
                label="Trigger Time"
                v-model="newRule.triggerTime"
                type="number"
              ></base-input>
            </div>
          </div>

          <br /><br />

          <div class="row pull-right">
            <div class="col-12">
              <base-button
                @click="createNewRule()"
                native-type="submit"
                type="primary"
                class="mb-3"
                size="lg"
                :disabled="$store.state.devices.length == 0"
              >
                Add Alarm Rule
              </base-button>
            </div>
          </div>
        </card>
        <card v-else> You need to select a device to create an Alarm </card>
      </div>
    </div>
    <!-- ALARMS TABLE -->
    <div class="row" v-if="$store.state.devices.length > 0">
      <div class="col-sm-12">
        <card>
          <div slot="header">
            <h4 class="card-title">Alarm Rules</h4>
          </div>

          <el-table
            v-if="$store.state.selectedDevice.alarmRules.length > 0"
            :data="$store.state.selectedDevice.alarmRules"
          >
            <el-table-column min-width="50" label="#" align="center">
              <div class="photo" slot-scope="{ row, $index }">
                {{ $index + 1 }}
              </div>
            </el-table-column>

            <el-table-column
              prop="variableFullName"
              label="Var Name"
            ></el-table-column>

            <el-table-column prop="variable" label="Variable"></el-table-column>

            <el-table-column
              prop="condition"
              label="Condition"
            ></el-table-column>

            <el-table-column prop="value" label="Value"></el-table-column>

            <el-table-column
              prop="triggerTime"
              label="Trigger Time"
            ></el-table-column>

            <el-table-column prop="counter" label="Matches"></el-table-column>

            <el-table-column header-align="right" align="right" label="Actions">
              <div
                slot-scope="{ row, $index }"
                class="text-right table-actions"
              >
                <el-tooltip content="Delete" effect="light" placement="top">
                  <base-button
                    @click="deleteDevice(row)"
                    type="danger"
                    icon
                    size="sm"
                    class="btn-link"
                  >
                    <i class="tim-icons icon-simple-remove"></i>
                  </base-button>
                </el-tooltip>

                <el-tooltip content="Rule Status" style="margin-left: 20px">
                  <i
                    class="fas fa-exclamation-triangle"
                    :class="{ 'text-warning': row.status }"
                  ></i>
                </el-tooltip>

                <!-- no ato row.status al v model porque al cambiar de status cambiaria directo sobre store lo que daría error en 
                      cambio uso el value, al accionar el switch no cambiará el objeto, pero podré cambiar el valor en la función -->
                <el-tooltip
                  content="Change Rule Status"
                  style="margin-left: 5px"
                >
                  <base-switch
                    @click="updateStatusRule(row)"
                    :value="row.status"
                    type="primary"
                    on-text="ON"
                    off-text="OFF"
                    style="margin-top: 10px"
                  ></base-switch>
                </el-tooltip>
              </div>
            </el-table-column>
          </el-table>

          <h4 v-else class="card-title">No Alarm Rules</h4>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import { Select, Option } from "element-ui";
import { Table, TableColumn } from "element-ui";

export default {
  middleware: "authenticated",
  components: {
    [Option.name]: Option,
    [Select.name]: Select,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
  },
  data() {
    return {
      alarmRules: [],
      selectedWidgetIndex: null,
      newRule: {
        dId: null,
        status: true,
        deviceName: null,
        variableFullName: null,
        variable: null,
        value: null,
        condition: null,
        triggerTime: null,
      },
    };
  },
  mounted() {
    console.log(this.$store.state.selectedDevice.alarmRules);
  },
  methods: {
    createNewRule() {
      if (this.selectedWidgetIndex == null) {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Variable must be selected",
        });
        return;
      }
      if (this.newRule.condition == null) {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Condition must be selected",
        });
        return;
      }
      if (this.newRule.value == null) {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Value must be selected",
        });
        return;
      }
      if (this.newRule.triggerTime == null) {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Trigger time must be selected",
        });
        return;
      }

      this.newRule.dId = this.$store.state.selectedDevice.dId;
      this.newRule.deviceName = this.$store.state.selectedDevice.name;
      this.newRule.variableFullName = this.$store.state.selectedDevice.template.widgets[
        this.selectedWidgetIndex
      ].variableFullName;
      this.newRule.variable = this.$store.state.selectedDevice.template.widgets[
        this.selectedWidgetIndex
      ].variable;

      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };

      let toSend = {
        newRule: this.newRule,
      };

      this.$axios
        .post("/alarm-rule", toSend, config)
        .then((res) => {
          if (res.data.status == "success") {
            $nuxt.$emit("time-to-get-devices");
            this.newRule.variable = null;
            this.newRule.condition = null;
            this.newRule.value = null;
            this.newRule.triggerTime = null;

            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! Alarm rule was added successfully",
            });
            this.$store.dispatch("getDevices");
            return;
          }
        })
        .catch((err) => {
          this.$notify({
            type: "warning",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Error",
          });
          console.log(err.response);
          return;
        });
    },

    updateStatusRule(rule) {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      var ruleCopy = JSON.parse(JSON.stringify(rule));
      ruleCopy.status = !ruleCopy.status;

      const toSend = { rule: ruleCopy };

      this.$axios
        .put("/alarm-rule", toSend, config)
        .then((res) => {
          if (res.data.status == "success") {
            this.$store.dispatch("getDevices");
            return;
          }
        })
        .catch((err) => {
          console.log(err.response);
        });
    },

    deleteDevice(rule) {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          emqxRuleId: rule.emqxRuleId,
        },
      };

      this.$axios
        .delete("/alarm-rule", config)
        .then((res) => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! Alarm rule was deleted",
            });
            this.$store.dispatch("getDevices");
            return;
          }
        })
        .catch((err) => {
          console.log(err.response);
          this.$notify({
            type: "error",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Error to delete a alarm rule",
          });
          return;
        });
    },
  },
};
</script>