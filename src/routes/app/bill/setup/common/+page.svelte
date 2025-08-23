<script lang="ts">
  import type { Bill } from "$lib/models/bill";
  import { billStore } from "$lib/stores/bill-store";
  import { onMount, tick } from "svelte";
  import Footer from "../footer.svelte";
  import { currencies } from "$lib/models/currencies";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { CalendarIcon, CheckIcon, ChevronsUpDownIcon } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { Calendar } from "$lib/components/ui/calendar";
  import {
    type DateValue,
    DateFormatter,
    getLocalTimeZone,
  } from "@internationalized/date";
  import Header from "../header.svelte";
  import { showAlert } from "$lib/stores/alert-dialog-store";
  import { settings } from "$lib/modules/settings";

  // 账单名称
  // 设定货币种类
  // 发生时间
  let bill_id: string;
  let bill: Bill;
  let selectorOpen = $state(false);
  let open = $state(false);

  let occured_at = $state<DateValue>();
  let selectedCurrency = $state("");
  let triggerRef = $state<HTMLButtonElement>(null!);

  // 账单数据
  let title = $state("");
  const df = new DateFormatter("zh-CN", {
    dateStyle: "long",
  });

  onMount(() => {
    localStorage.removeItem("bill_current_setup_data");
  });

  function closeAndFocusTrigger() {
    tick().then(() => {
      selectorOpen = false;
      triggerRef.focus();
    });
  }

  $effect(() => {
    if(!occured_at) return;
    localStorage.setItem(
      "bill_current_setup_data",
      JSON.stringify({
        title,
        currency: selectedCurrency,
        occured_at: new Date(occured_at!.year, occured_at!.month, occured_at!.day),
      })
    );
  });

  function titleCheck(){
    if(title.length < 3) {
      title = "";
      showAlert("错误", "标题长度至少为3个字符.");
    }
  }
</script>

<Header />

<div class="mx-auto w-full max-w-sm mb-10">
  <div class="grid gap-4">
    <!-- 账单名称 -->
    <div>
      <Label class="block text-sm font-medium mb-1">账单名称</Label>
      <Input
        class="w-full rounded-xl border p-2"
        type="text"
        bind:value={title}
        placeholder="例如：日本旅行"
        onblur={titleCheck}
      />
    </div>

    <!-- 设定货币种类 -->
    <div>
      <Label class="block text-sm font-medium mb-1">货币种类</Label>
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
              {selectedCurrency || "选择货币种类"}
              <ChevronsUpDownIcon class="opacity-50" />
            </Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-[200px] p-0">
          <Command.Root>
            <Command.Input placeholder="货币..." />
            <Command.List>
              <Command.Group value="members">
                {#each $settings.defaultCurrencies as currency (currency)}
                  <Command.Item
                    value={currency}
                    onSelect={() => {
                      selectedCurrency = currency;
                      closeAndFocusTrigger();
                    }}
                  >
                    <CheckIcon
                      class={cn(
                        selectedCurrency !== currency && "text-transparent"
                      )}
                    />
                    {currency}
                  </Command.Item>
                {/each}
              </Command.Group>
            </Command.List>
          </Command.Root>
        </Popover.Content>
      </Popover.Root>
    </div>

    <!-- 账单开始时间 -->
    <div>
      <Label class="block text-sm font-medium mb-1">开始时间</Label>
      <Popover.Root>
        <Popover.Trigger>
          {#snippet child({ props })}
            <Button
              variant="outline"
              class={cn(
                "w-full justify-start text-left font-normal",
                !occured_at && "text-muted-foreground"
              )}
              {...props}
            >
              <CalendarIcon class="mr-2 size-4" />
              {occured_at
                ? df.format(occured_at.toDate(getLocalTimeZone()))
                : "选择起始日期"}
            </Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-full p-0">
          <Calendar bind:value={occured_at} type="single" initialFocus />
        </Popover.Content>
      </Popover.Root>
    </div>
  </div>
</div>

<Footer step={0} />
