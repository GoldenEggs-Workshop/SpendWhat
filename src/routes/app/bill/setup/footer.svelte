<script lang="ts">
  import { goto } from "$app/navigation";
  import { SETUP_VERSION } from "$lib";
  import { Button } from "$lib/components/ui/button";
  import { Bill } from "$lib/models/bill";
  import { BillMember } from "$lib/models/bill-member";
  import { User } from "$lib/models/user";
  import { showAlert } from "$lib/stores/alert-dialog-store";
  import { billStore, currentBill } from "$lib/stores/bill-store";
  import { currentUser } from "$lib/stores/user-store";
  import { NavigateTo } from "$lib/utils/navigating";
  import billSetupStore from "$lib/stores/bill-setup-store";

  export let step = 0;

  const NEXT = ["member", "../detail"];
  const PREV = ["", "common"];
  
  async function checkNext() {
    if (step == 0) {
      let newBillData = localStorage.getItem("bill_current_setup_data");
      if (!newBillData) {
        showAlert("错误", "请先填写账单信息");
        return;
      }

      let billData = JSON.parse(newBillData);
      billSetupStore.set(new Bill(
        billData.title,
        $currentUser!,
        [],
        [],
        new Date(),
        new Date(),
        billData.currency,
        new Date(billData.occured_at)
      ));
      await $billSetupStore.createToServer();
    }

    if (step == 1) {
      let newBillMembers = localStorage.getItem("bill_current_setup_members");
      if (!newBillMembers) {
        showAlert("错误", "请先添加账单成员");
        return;
      }

      console.log("新建账单:", $billSetupStore);
      billStore.addBill($billSetupStore);
      currentBill.set($billSetupStore);
      NavigateTo(`/app/bill/detail`);
    }
    goto(`./${NEXT[step]}`, { replaceState: true });
  }
</script>

<div
  class="flex flex-row items-center justify-between w-full border-t md:border md:rounded-lg border-border py-4 px-8 mt-10"
>
  <Button
    variant="secondary"
    class="w-24"
    href="./{PREV[step]}"
    id="setup-prev-button"
    data-right="#setup-next-button">上一步</Button
  >
  <Button
    class="font-semibold w-24"
    onclick={checkNext}
    id="setup-next-button"
    data-left="#setup-prev-button">下一步</Button
  >
</div>
