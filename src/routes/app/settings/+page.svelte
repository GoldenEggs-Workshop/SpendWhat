<script lang="ts">
  import SettingCard from "$lib/components/settings/settings-card.svelte";
  import { Button } from "$lib/components/ui/button";
  import Combobox from "$lib/components/ui/combox/combobox.svelte";
  import { Input } from "$lib/components/ui/input";
  import { Switch } from "$lib/components/ui/switch";
  import { settings } from "$lib/modules/settings/settings";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import CommandList from "$lib/components/ui/command-list/command-list.svelte";
  import { convertToComboBox } from "$lib/modules/settings/util";
  import { testFunction } from "$lib/utils";
  import { ComboBox } from "$lib/components/ui/combox";
  import { currencies } from "$lib/models/currencies";

  let importDialog = $state(false);
  let emojiDialog = $state(false);
  let currencyDialog = $state(false);

  let defaultCurrenciesItems = $derived(
    $settings.defaultCurrencies.map((c) => ({ value: c, label: c }))
  );

  let newCurrency = $state("");
</script>

<div class="space-y-3 pb-10 lg:max-w-4xl">
  <div class="font-weight-bold text-xl font-bold">主题设置</div>
  <SettingCard let:id title="主题模式" description="浅色 / 深色 / 跟随系统">
    <Combobox
      items={[
        { value: "light", label: "浅色" },
        { value: "dark", label: "深色" },
        { value: "system", label: "跟随系统" },
      ]}
      bind:value={$settings.theme}
    />
  </SettingCard>

  <div class="font-weight-bold text-xl font-bold">语言设置</div>
  <SettingCard let:id title="选择语言" description="未来将会支持更多语言.">
    <Combobox items={convertToComboBox()} bind:value={$settings.language} />
  </SettingCard>

  <div class="font-weight-bold text-xl font-bold">账单设置</div>
  <SettingCard
    let:id
    title="常用货币"
    description="在这里选择你的常用货币, 可减少索引时间."
  >
    <Button
      variant="outline"
      onclick={() => {
        currencyDialog = true;
      }}>设置货币</Button
    >
  </SettingCard>
  <SettingCard
    let:id
    title="默认账单时间格式"
    description="设置默认的账单时间格式."
  >
    <Combobox
      items={[
        { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
        { value: "YYYY/MM/DD", label: "YYYY/MM/DD" },
      ]}
      bind:value={$settings.billTimeFormat}
    />
  </SettingCard>
  <SettingCard
    let:id
    title="更多账单表情"
    description="添加更多默认表情, 以供创建账单时使用!"
  >
    <Button
      variant="outline"
      onclick={() => {
        // emojiDialog = true;
      }}
      disabled={true}>添加表情</Button
    >
  </SettingCard>

  <SettingCard
    let:id
    title="自动加入账单"
    description="创建账单后, 是否默认将创建者加入成员."
  >
    <Switch {id} bind:checked={$settings.autoJoinBill} />
  </SettingCard>

  <div class="font-weight-bold text-xl font-bold">客户端设置</div>
  <SettingCard
    let:id
    title="离线模式"
    description="若启动离线模式, 所有账单信息均不会上传至服务器, 您需要自行保管数据."
  >
    <Switch {id} bind:checked={$settings.offlineMode} />
  </SettingCard>

  <SettingCard
    let:id
    title="远程服务器地址"
    description="如果您自搭建服务器, 可在这里改为您的地址. 修改后请手动重启软件."
  >
    <Input {id} class="w-2/5" bind:value={$settings.remoteUrl} />
  </SettingCard>
  <SettingCard
    let:id
    title="数据同步策略"
    description="自动 / 手动 / Wi-Fi 下才同步. 若启用了离线模式, 该选项将被禁用."
  >
    <Combobox
      items={[
        { value: "auto", label: "自动" },
        { value: "manual", label: "手动" },
        { value: "wifi", label: "Wi-Fi 下才同步" },
      ]}
      bind:value={$settings.syncStrategy}
    />
  </SettingCard>

  <SettingCard let:id title="导出/导入" description="将所有账单数据导出为Json.">
    <Button
      {id}
      variant="outline"
      onclick={() => {
        importDialog = true;
      }}>导入</Button
    >
    <Button
      {id}
      variant="outline"
      onclick={() => {
        // importDialog = true;
      }}>导出</Button
    >
  </SettingCard>
  <div class="font-weight-bold text-xl font-bold">开发选项</div>
  <SettingCard let:id title="测试" description="请勿触碰.">
    <Button {id} variant="outline" onclick={testFunction}>测试</Button>
  </SettingCard>
</div>

{#key importDialog}
  <Dialog.Root bind:open={importDialog}>
    <Dialog.Content>
      <Dialog.Title>导入账单数据</Dialog.Title>
      <Dialog.Description>从Json文件导入账单数据.</Dialog.Description>
      <Input type="file" accept=".json" />
      <Dialog.Footer>
        <Button
          variant="outline"
          onclick={() => {
            importDialog = false;
          }}>取消</Button
        >
        <Button variant="outline">导入</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
{/key}

{#key emojiDialog}
  <Dialog.Root bind:open={emojiDialog}>
    <Dialog.Content class="w-68">
      <Dialog.Title>设置表情</Dialog.Title>
      <!-- <CommandList bind:items={$settings.billEmojis} /> -->
    </Dialog.Content>
  </Dialog.Root>
{/key}

{#key currencyDialog}
  <Dialog.Root bind:open={currencyDialog}>
    <Dialog.Content class="w-68">
      <Dialog.Title>添加货币</Dialog.Title>
      <ComboBox
        bind:value={newCurrency}
        items={Object.entries(currencies).map(([code, data]) => ({
          value: code,
          label: code,
        }))}
      />
      <CommandList bind:items={defaultCurrenciesItems} />
    </Dialog.Content>
  </Dialog.Root>
{/key}
