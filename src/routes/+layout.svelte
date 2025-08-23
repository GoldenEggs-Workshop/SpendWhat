<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/sidebar/app-sidebar.svelte";
  import SiteHeader from "$lib/components/sidebar/site-header.svelte";
  import MyAlertDialog from "$lib/components/my-alert-dialog.svelte";
  import { onMount } from "svelte";
  import { loginByCookie } from "$lib/stores/user-store";
  import { isBillPageNow } from "$lib/utils/navigating";
  import { onNavigate } from "$app/navigation";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { cn, initApp } from "$lib/utils";
  const { children } = $props<{
    children: any;
  }>();

  onMount(async () => {
    await initApp();
    //防止一开始就是bill页面
    isBillPageNow();
  });

  onNavigate((nav) => {
    if (nav.to?.url) {
      isBillPageNow(nav.to.url.pathname);
    }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Toaster />

<Sidebar.Provider
  style={cn("--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);")}
>
  <AppSidebar />
  <Sidebar.Inset>
    <SiteHeader />
    <div class="flex flex-1 flex-col ">
      <div class="@container/main flex flex-1 flex-col gap-2">
        <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div class="px-4 lg:px-6 ">
            <main>
              {@render children?.()}
            </main>
          </div>
        </div>
      </div>
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>

<MyAlertDialog />
