<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { currentUser } from "$lib/stores/user-store";
  import type { User } from "$lib/models/user";
  import { CheckIcon, ChevronsUpDownIcon } from "lucide-svelte";
  import { tick } from "svelte";
  import { cn } from "$lib/utils";
  import type { Bill } from "$lib/models/bill";
  import { billStore, currentBill } from "$lib/stores/bill-store";
  import { BillItem } from "$lib/models/bill-item";
  import { showAlert } from "$lib/stores/alert-dialog-store";
  import type { BillMember } from "$lib/models/bill-member";
  import { settings } from "$lib/modules/settings";

  let {
    title,
    open = $bindable(),
    bill,
  } = $props<{
    title: string;
    open: boolean;
    bill: Bill | undefined;
  }>();


  let bill_type = $state("");
  let emoji = $state($settings.billEmojis[0]);
  let description = $state("");
  let amount: number = $state(0);
  let occurred_time = $state(new Date().toLocaleString("sv-SE"));

  let selectedUserName = $state($currentUser!.username);
  let selectorOpen = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);

  let selectedUser = $derived(() => {
    return (bill.members as BillMember[]).find(
      (f) => f.name === selectedUserName
    );
  });
  const selectedValue = $derived(
    (bill.members as BillMember[]).find((f) => f.name === selectedUserName)
      ?.name
  );
  
  $effect(() => {});

  function closeAndFocusTrigger() {
    tick().then(() => {
      triggerRef.focus();
    });
  }

  async function addItem() {
    open = false;

    //如果有一项未填则不许通过
    if (!bill_type || !description || !amount || !emoji) {
      showAlert("错误", "请填写所有必填项");
      return;
    }

    let user = selectedUser();
    if (!user) {
      showAlert("错误", "请选择一个支付方");
      return;
    }
    if (!bill) {
      showAlert("错误", "bill不能为空");
      return;
    }

    let newItem = new BillItem(
      bill,
      bill_type,
      emoji,
      description,
      amount,
      $currentBill!.currency,
      user,
      new Date(),
      new Date(occurred_time)
    );

    await newItem.createToServer();
    await $currentBill?.addItem(newItem);
    billStore.updateCurrentBill();


  }
</script>

<Dialog.Root {open} onOpenChange={(v) => (open = v)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>
        {title}
      </Dialog.Title>
    </Dialog.Header>

    <div class="grid gap-2">
      <Label class="text-sm">描述</Label>
      <Input bind:value={description} placeholder="描述" />

      <Label class="text-sm">类型</Label>
      <Input bind:value={bill_type} placeholder="类型" />

      <Label class="text-sm">表情</Label>
      <!-- 限制的 emoji 选择 -->
      <Select.Root type="single" bind:value={emoji}>
        <Select.Trigger>
          {emoji}
        </Select.Trigger>
        <Select.Content>
          {#each $settings.billEmojis as e (e)}
            <Select.Item value={e}>{e}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>

      <Label class="text-sm">金额</Label>
      <Input bind:value={amount} type="number" placeholder="金额" />

      <Label class="text-sm">支付方</Label>

      <Popover.Root bind:open={selectorOpen}>
        <Popover.Trigger bind:ref={triggerRef}>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="outline"
              class="w-[200px] justify-between"
              role="combobox"
              aria-expanded={open}
            >
              {selectedValue || "选择支付方"}
              <ChevronsUpDownIcon class="opacity-50" />
            </Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-[200px] p-0">
          <Command.Root>
            <Command.Input placeholder="搜索成员..." />
            <Command.List>
              <Command.Empty>暂无成员.</Command.Empty>
              <Command.Group value="members">
                {#each bill.members as memberItem (memberItem.id)}
                  <Command.Item
                    value={memberItem.name}
                    onSelect={() => {
                      selectedUserName = memberItem.name;
                      closeAndFocusTrigger();
                    }}
                  >
                    <CheckIcon
                      class={cn(
                        selectedUserName !== memberItem.name &&
                          "text-transparent"
                      )}
                    />
                    {memberItem.name}
                  </Command.Item>
                {/each}
              </Command.Group>
            </Command.List>
          </Command.Root>
        </Popover.Content>
      </Popover.Root>

      <Label class="text-sm">发生时间</Label>
      <Input type="datetime-local" bind:value={occurred_time} />
    </div>

    <Dialog.Footer>
      <Button
        variant="ghost"
        onclick={() => {
          open = false;
        }}>取消</Button
      >
      <Button onclick={addItem}>添加</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
