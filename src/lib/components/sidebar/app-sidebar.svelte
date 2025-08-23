<script lang="ts">
  import {
    SettingsIcon,
    Search,
    SquarePlus,
    Coins,
    Maximize,
  } from "lucide-svelte";

  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { currentUser } from "$lib/stores/user-store";
  import { billStore } from "$lib/stores/bill-store";
  import BillSideCard from "$lib/components/sidebar/bill-side-card.svelte";
  import { NavigateTo } from "$lib/utils/navigating";
  import * as SearchDialog from "$lib/components/dialog/search-dialog/dialog/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import {
    searchDialog,
    showSearchDialog,
  } from "$lib/stores/search-dialog-store";
  import Input from "../ui/input/input.svelte";
  import api from "$lib/utils/request";
  import { toast } from "svelte-sonner";
  import Post from "$lib/utils/request";

  let token = $state("");
  let joinBillOpen = $state(false);
  let sidebarOpen = $state(false);
  async function joinBill() {
    if (!token) return;
    let data = {
      token: token,
    };
    Post("/app/bill/share/consume", data)
      .then(async () => {
        joinBillOpen = false;
        token = "";
        toast.success("加入成功");
        await billStore.refreshBill();
        NavigateTo("/");
      })
      .catch((error) => {
        toast.error("加入失败", {
          description: error.message || "网络错误",
        });
      });
  }
</script>

<SearchDialog.Root bind:open={$searchDialog!.open}>
  <SearchDialog.Content class="sm:max-w-[425px]">
    <div></div>
  </SearchDialog.Content>
</SearchDialog.Root>

<Sidebar.Root bind:open={sidebarOpen}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
          <a href="/" class="flex items-center gap-2 ml-1">
            <Coins size={18} />
            <span class="text-lg font-semibold">SpendWhat</span>
          </a>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <!--上栏-->
            <div class="mb-6">
              <Sidebar.MenuButton>
                <Button
                  class="flex items-center sm:flex outline outline-offset-2"
                  variant="ghost"
                  onclick={() => {
                    NavigateTo("/app/bill/setup");
                  }}
                >
                  <div class="flex -ml-3 items-center">
                    <SquarePlus />
                    <span class="text-base ml-2">新账单</span>
                  </div>
                </Button>
              </Sidebar.MenuButton>
              <Sidebar.MenuButton>
                <Button
                  class="flex items-center sm:flex outline outline-offset-2"
                  variant="ghost"
                  onclick={() => {
                    joinBillOpen = true;
                  }}
                >
                  <div class="flex -ml-3 items-center">
                    <Maximize />
                    <span class="text-base ml-2">加入账单</span>
                  </div>
                </Button>
              </Sidebar.MenuButton>
              <Sidebar.MenuButton>
                <Button
                  class="flex items-center sm:flex outline outline-offset-2"
                  variant="ghost"
                  onclick={() => {
                    showSearchDialog();
                  }}
                >
                  <div class="flex -ml-3 items-center">
                    <Search />
                    <span class="text-base ml-2">搜索账单</span>
                  </div>
                </Button>
              </Sidebar.MenuButton>
            </div>

            <span class="ml-3 mb-2 font-medium text-base text-gray-600"
              >账单</span
            >

            {#if $currentUser}
              {#each $billStore! as item (item.id)}
                <BillSideCard bill={item} />
              {/each}
            {/if}
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Separator class="my-2" />
        <div style="float: left;">
          <Sidebar.MenuButton>
            <div style="display: flex; align-items: center;">
              <a href="/app/settings/account" class="flex items-center">
                {#if $currentUser}
                  <span class="ml-1">{$currentUser.username}</span>
                {:else}
                  <span class="ml-1">请登录</span>
                {/if}
              </a>
            </div>
          </Sidebar.MenuButton>
        </div>
        <div style="float: right;">
          <Sidebar.MenuButton>
            <a href="/app/settings">
              <SettingsIcon size={18} />
            </a>
          </Sidebar.MenuButton>
        </div>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Footer>
</Sidebar.Root>

<Dialog.Root bind:open={joinBillOpen}>
  <Dialog.Content>
    <Dialog.Header>加入账单</Dialog.Header>
    <Dialog.Description>粘贴其他人给你的Token, 以加入账单</Dialog.Description>
    <Input
      class="mt-1"
      placeholder="token"
      bind:value={token}
      onkeydown={async (e) => {
        if (e.key === "Enter") {
          await joinBill();
        }
      }}
    />
    <Dialog.Footer>
      <Button variant="outline" onclick={joinBill}>加入</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
