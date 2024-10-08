"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/catalyst/avatar";

import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "@/components/catalyst/dropdown";
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from "@/components/catalyst/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "@/components/catalyst/sidebar";
import { SidebarLayout } from "@/components/catalyst/sidebar-layout";
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
  RectangleGroupIcon,
  RectangleStackIcon
} from "@heroicons/react/16/solid";
import {
  Cog6ToothIcon,
  HomeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  Square2StackIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
} from "@heroicons/react/20/solid";
import ThemeToggle from "../../themeToggle";
import SearchPalette from "./Search";
import { useTaskStore } from "@/providers/task-store-provider";
import SidebarTasksAccordian from "./SidebarTasksAccordian";

export default function LayoutSidebar({ children }: any) {
  const pathname = usePathname();
  const projectID = pathname.split("/")[1];
  const route = pathname.split("/").slice(-1)[0] 

  const [open, setOpen] = useState(false);
  const tasks = useTaskStore((state) => state.tasks);
  // console.log('Tasks: ', tasks)

  return (
    <>
      <SearchPalette open={open} setOpen={setOpen} />
      <SidebarLayout
        navbar={
          <Navbar>
            <NavbarSpacer />
            <NavbarSection>
              <NavbarItem aria-label="Search">
                <MagnifyingGlassIcon />
              </NavbarItem>
              <NavbarItem aria-label="Inbox">
                <InboxIcon />
              </NavbarItem>
              <Dropdown>
                <DropdownButton as={NavbarItem}>
                  <Avatar src="/Headshot.jpg" square />
                </DropdownButton>
                <DropdownMenu className="min-w-64" anchor="bottom end">
                  <DropdownItem href="/my-profile">
                    <UserIcon />
                    <DropdownLabel>My profile</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/settings">
                    <Cog8ToothIcon />
                    <DropdownLabel>Settings</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem href="/privacy-policy">
                    <ShieldCheckIcon />
                    <DropdownLabel>Privacy policy</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/share-feedback">
                    <LightBulbIcon />
                    <DropdownLabel>Share feedback</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem href="/logout">
                    <ArrowRightStartOnRectangleIcon />
                    <DropdownLabel>Sign out</DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarSection>
          </Navbar>
        }
        sidebar={
          <Sidebar>
            <SidebarHeader>
              <Dropdown>
                <DropdownButton as={SidebarItem} className="lg:mb-2.5">
                  <Avatar
                    slot="icon"
                    initials="SP"
                    className="bg-blue-500 text-white"
                  />
                  <SidebarLabel>Snap Park</SidebarLabel>
                  <ChevronDownIcon />
                </DropdownButton>
                <DropdownMenu
                  className="min-w-80 lg:min-w-64"
                  anchor="bottom start"
                >
                  <DropdownItem>
                    <Avatar
                      slot="icon"
                      initials="CC"
                      className="bg-blue-500 text-white"
                    />
                    <DropdownLabel>Cross Copy</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem>
                    <Avatar
                      slot="icon"
                      initials="R"
                      className="bg-blue-500 text-white"
                    />
                    <DropdownLabel>Ream</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem>
                    <PlusIcon />
                    <DropdownLabel>New project&hellip;</DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <SidebarSection className="max-lg:hidden">
                <SidebarItem onClick={() => setOpen(!open)}>
                  <MagnifyingGlassIcon />
                  <SidebarLabel>Search</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
            </SidebarHeader>
            <SidebarBody>
              <SidebarSection>
                <SidebarItem current={route === 'dashboard'} href={`/${projectID}/dashboard`}>
                  <HomeIcon />
                  <SidebarLabel>Overview</SidebarLabel>
                </SidebarItem>
                <SidebarItem current={route === 'tasks'}  href={`/${projectID}/dashboard/tasks`}>
                  <Square2StackIcon />
                  <SidebarLabel>Tasks</SidebarLabel>
                </SidebarItem>
                <SidebarItem current={route === 'team'} href={`/${projectID}/dashboard/team`}>
                  <UserGroupIcon />
                  <SidebarLabel>Team</SidebarLabel>
                </SidebarItem>
                <SidebarItem current={route === 'settings'} href={`/${projectID}/dashboard/settings`}>
                  <Cog6ToothIcon />
                  <SidebarLabel>Settings</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
              <SidebarSection className="max-2xl:hidden">
              <SidebarHeading>All Stages</SidebarHeading>
                <SidebarTasksAccordian tasks={tasks}/>
                {/* 
                <SidebarItem href={`/${projectID}/dashboard/tasks?taskID=0045`}>
                  <RectangleStackIcon className="h-6 w-6  text-blue-400" />
                  <span className="font-mono text-sm leading-1">0045</span>{" "}
                  Started
                </SidebarItem>
                <SidebarItem href={`/${projectID}/dashboard/tasks?taskID=0044`}>
                  <RectangleStackIcon className="h-6 w-6  text-blue-400" />
                  <span className="font-mono text-sm leading-1">0044</span>{" "}
                  Started
                </SidebarItem>
                <SidebarItem href={`/${projectID}/dashboard/tasks?taskID=0043`}>
                  <RectangleStackIcon className="h-6 w-6  text-blue-400" />
                  <span className="font-mono text-sm leading-1">0043</span>{" "}
                  Started
                </SidebarItem> */}
              
              </SidebarSection>
              <SidebarSpacer />
              <SidebarSection>
                <ThemeToggle />
                <SidebarItem
                  href="https://tomcarruthers.com/contact"
                  target="_blank"
                >
                  <QuestionMarkCircleIcon />
                  <SidebarLabel>Contact</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="https://github.com/Cedarche/NextJS-Demo"
                  target="_blank"
                >
                  <SparklesIcon />
                  <SidebarLabel>Github Repository</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
            </SidebarBody>
            <SidebarFooter className="max-lg:hidden">
              <Dropdown>
                <DropdownButton as={SidebarItem}>
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar
                      src="/Headshot_small.jpg"
                      className="size-10 object-contain"
                      square
                      alt="Tom Carruthers Headshot"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                        Tom
                      </span>
                      <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                        tomcarruthers96@gmail.com
                      </span>
                    </span>
                  </span>
                  <ChevronUpIcon />
                </DropdownButton>
                <DropdownMenu className="min-w-64" anchor="top start">
                  <DropdownItem>
                    <UserIcon />
                    <DropdownLabel>My profile</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem>
                    <Cog8ToothIcon />
                    <DropdownLabel>Settings</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem>
                    <ShieldCheckIcon />
                    <DropdownLabel>Privacy policy</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem>
                    <LightBulbIcon />
                    <DropdownLabel>Share feedback</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem>
                    <ArrowRightStartOnRectangleIcon />
                    <DropdownLabel>Sign out</DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </SidebarFooter>
          </Sidebar>
        }
      >
        {children}
      </SidebarLayout>
    </>
  );
}
