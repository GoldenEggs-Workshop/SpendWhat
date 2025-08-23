<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { BillMember } from "$lib/models/bill-member";
  import { showAlert } from "$lib/stores/alert-dialog-store";
  import Footer from "../footer.svelte";
  import Header from "../header.svelte";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { NavigateTo } from "$lib/utils/navigating";
  import { currentUser } from "$lib/stores/user-store";
  import { User } from "$lib/models/user";
  import billSetupStore from "$lib/stores/bill-setup-store";

  // 邀请成员
  // 设定角色
  // 设定权限 成员不可替其他人记账, 仅可查看.

  let newName = $state("");
  let newMembers: { name: string; user?: User }[] = $state([]);
  onMount(async () => {
    if (!$currentUser) {
      showAlert("错误", "请先登录");
      toast.error("你是怎么到这里来的?");
      NavigateTo("/app/user/login");
      return;
    }
    let newMember = new BillMember($currentUser.username, $billSetupStore);
    await newMember.createToServer();
    let user = new User($currentUser.id, $currentUser.username);
    newMember.bindUser(user);
    await newMember.bindUserToServer();
    newMembers.push({ name: $currentUser.username, user: $currentUser });
  });

  function addMember() {
    if (!newName.trim()) {
      showAlert("提示", "请输入成员名字");
      return;
    }

    if (newMembers.length >= 5) {
      toast.warning("哎呀, 一次性添加的成员太多了.稍后在成员管理页面再添加吧!");
      return;
    }
    let members: BillMember[] = [];
    newMembers.forEach(async (member: any) => {
      let newMember = new BillMember(member.name, $billSetupStore);
      await newMember.createToServer();
      if (member.user) {
        let user = new User(member.user.id, member.user.username);
        newMember.bindUser(user);
        await newMember.bindUserToServer();
      }
      members.push(newMember);
      $billSetupStore.addNewMember(newMember);
    });
    newMembers.push({ name: newName });
    newName = "";
  }

  $effect(() => {
    localStorage.setItem(
      "bill_current_setup_members",
      JSON.stringify(newMembers)
    );
  });
</script>

<Header />

<div class="mx-auto w-full max-w-sm mb-10">
  <Label class="block text-base font-medium mb-1"
    >您可以在此直接添加成员, 或者, 稍后您可以通过右上角分享按钮,
    将此账单分享给其他人.</Label
  >
  <div class="grid gap-4">
    <div class="flex gap-2 mt-2">
      <Input placeholder="成员名字" bind:value={newName} />
      <Button onclick={addMember}>添加</Button>
    </div>

    {#each newMembers as member (member)}
      <div class="flex items-center gap-3 border rounded-2xl p-2">
        <Avatar.Root>
          <Avatar.Fallback>{member.name.charAt(0)}</Avatar.Fallback>
        </Avatar.Root>
        <Label class="text-base ml-1">{member.name}</Label>
        {#if member.user}
          <Label class="text-base ml-auto mr-1">你自己</Label>
        {/if}
      </div>
    {/each}
  </div>
</div>

<Footer step={1} />
