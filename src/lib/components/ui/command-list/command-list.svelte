<script lang="ts">
  import * as Command from "$lib/components/ui/command/index.js";
  import { tick } from "svelte";
  import Input from "../input/input.svelte";
  import { Button } from "../button";
  import { Trash } from "lucide-svelte";

  let { items = $bindable() } = $props<{
    items: { value: string; label: string }[];
  }>();

  $inspect(items);
</script>

<Command.Root>
  <Command.Input placeholder="搜索..." />
  <Command.List>
    <Command.Empty>什么也没有...</Command.Empty>
    <Command.Group>
      {#each items as item (item.value)}
        <Command.Item
          value={item}>
          <div class="flex justify-between">
            <Input class="text-3xl p-0 pl-2 pr-2" bind:value={item.value} maxlength={1}/>
          </div>
          <Button class="ml-auto" variant="ghost">
            <Trash color="#e02e2e" strokeWidth={2} size={28} class="mr-2" />
          </Button>
        </Command.Item>
      {/each}
    </Command.Group>
  </Command.List>
</Command.Root>
