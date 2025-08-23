import { BillItem } from "$lib/models/bill-item";
import { User } from "$lib/models/user";
import Post from "$lib/utils/request";
import { showAlert } from "$lib/stores/alert-dialog-store";
import axios from "axios";
import { BillMember } from "$lib/models/bill-member";
import { BillRole } from "$lib/enum/roles";
import type { BillMemberPublic, UserPublic } from "./ResponseItem/BillPublic";
import { getAllRate, getRate } from "$lib/utils";
import { CurrencyRate } from "./rate";
import { Currency } from "lucide-svelte";

export class Bill {
  id?: string;
  title: string;
  owner: User;
  members: BillMember[];
  items: BillItem[]; // 可以换成 Member[] 如果成员有更多信息
  created_time: Date;
  occurred_at: Date;
  item_updated_time: Date;
  currency: string;
  rate?: CurrencyRate;
  rate_last_modified?: Date;

  constructor(
    title: string,
    owner: User,
    members: BillMember[],
    items: BillItem[],
    created_time: Date,
    item_updated_time: Date,
    currency: string,
    occurred_at: Date
  ) {
    this.title = title;
    this.currency = currency;
    this.owner = owner;
    this.members = members;
    this.items = items;
    this.occurred_at = occurred_at;
    this.created_time = created_time;
    this.item_updated_time = item_updated_time;
  }

  getUserFromBillMember(user: User): BillMember | undefined {
    return this.members.find((member) => member.user?.id === user.id);
  }

  // 计算某个成员的支出
  getMemberSpending(member: BillMember): number {
    return this.items
      .filter((item) => item.paid_by.id === member.id)
      .reduce((total, item) => Number(total) + Number(item.amount), 0);
  }

  get totalAmount(): number {
    return this.items.reduce((total, item) => Number(total) + Number(item.amount), 0);
  }

  async createToServer() {
    try {
      let data = {
        title: this.title,
        occurred_at: this.occurred_at.toISOString(),
        currency: this.currency,
      };
      const response = await Post("/bill/create", data);
      let responseData = await response.json();
      this.id = responseData.id;
      let rates = await getAllRate(this.currency);
      this.rate = new CurrencyRate(this.currency, rates[this.currency.toLocaleLowerCase()]);
      console.log("获取汇率成功:", this.rate);
    } catch (error) {
      showAlert("错误", "账单创建失败.");
      console.error("账单创建失败:", error);
    }
  }

  async updateToServer() {
    // try {
    //   //将Bill模型转为json
    //   let data = {
    //     id: this.id,
    //     title: this.title,
    //     owner_id: this.owner.id,
    //     members_id: this.members.map(member => member.id),
    //     items_id: this.items.map(item => item.id),
    //   };
    //   console.log("上传账单数据:", data);
    //   const response = await api.post("/bill/update", data);
    //   console.log("上传账单成功:", response.data);
    //   this.id = response.data.bill_id;
    // } catch (error) {
    //   showAlert("错误", "上传账单失败.");
    //   console.error("上传账单失败:", error);
    // }
  }
  async getItemFromServer() {
    if (!this.id) {
      return;
    }
    this.items = [];
    try {
      let data = {
        bill_id: this.id,
        skip: 0,
        limit: 30,
      };
      const response = await Post(`/bill/item/list`, data);
      let responseData = await response.json();
      responseData.forEach((item: any) => {
        console.log("获取账单项:", item);
        //如果id有重则不新建
        let member = new BillMember(item.paid_by.name, this, item.paid_by.id);
        if(item.paid_by.linked_user){
          member.bindUser(new User(item.paid_by.linked_user.id,item.paid_by.linked_user.username));
        }

        if (!this.items.find((i) => i.id === item._id)) {
          const billItem = new BillItem(
            this,
            item.type,
            item.type_icon,
            item.description,
            item.amount as number,
            item.currency,
            member,
            new Date(item.created_time),
            new Date(item.occurred_time)
          );
          billItem.id = item._id; // 赋值数据库id
          this.items.push(billItem);
        }
      });

      const roleResponse = await Post("/bill/access/list", {
        bill_id: this.id,
      });

      interface UserRole {
        user_id: string;
        role: "owner" | "member" | "observer";
      }

      let roleResponseData = await roleResponse.json();
      // 假设 roleResponse.data 是 any[]，先用 map 转成类型安全的 UserRole[]
      const userRoles: UserRole[] = roleResponseData.map((u: any) => ({
        user_id: u.user_id,
        role: u.role,
      }));

      const userRoleMap = new Map(
        userRoles.map((u) => [u.user_id, u] as [string, UserRole])
      );

      const membersMap = new Map(
        this.members
          .filter((m) => m.isBound)
          .map((m) => [m.user!.id, m] as [string, BillMember])
      );

      userRoleMap.forEach((userRoleObj, userId) => {
        const member = membersMap.get(userId);
        if (member) {
          switch (userRoleObj.role) {
            case "owner":
              member.setRole(BillRole.Owner);
              break;
            case "member":
              member.setRole(BillRole.Member);
              break;
            case "observer":
              member.setRole(BillRole.Observer);
              break;
          }
        }
      });
      console.log("获取账单项成功:", this.members);
      console.log("获取账单项成功:", this);
    } catch (error) {
      showAlert("错误", "获取账单失败.");
      console.error("获取账单失败:", error);
    }
  }

   addItem(newItem: BillItem) {
    this.items.push(newItem);
    this.updateItemTime();
  }

  // 删除账单项
  async removeItem(updatedItem: BillItem) {
    const index = this.items.findIndex((item) => item.id === updatedItem.id);
    if (index !== -1) {
      this.items.splice(index, 1);
      await updatedItem.remove();
      this.updateItemTime();
    }
  }

  // 更新账单项
  async updateItem(updatedItem: BillItem) {
    const index = this.items.findIndex((item) => item.id === updatedItem.id);
    if (index !== -1) {
      this.items[index] = updatedItem;
      await updatedItem.updateToServer();
      this.updateItemTime();
    }
  }

  // 根据ID获取账单项
  getItemById(itemId: string): BillItem | undefined {
    return this.items.find((item) => item.id === itemId);
  }

  // 添加新成员
  addNewMember(member: BillMember) {
    this.members.push(member);
    this.updateToServer();
  }

  // 更新账单项更新时间
  private updateItemTime() {
    this.item_updated_time = new Date();
    this.updateToServer();
  }
}

export interface BillResponseItem {
  created_by: UserPublic;
  created_time: Date;
  id: string;
  item_updated_time: Date;
  members: BillMemberPublic[];
  title: string;
  [property: string]: any;
}

export function mapResponseToBills(responseData: BillResponseItem[]): Bill[] {
  return responseData.map((item) => {
    console.log("映射账单数据:", item);

    const items: BillItem[] = [];

    const bill = new Bill(
      item.title,
      new User(item.created_by.id, item.created_by.username),
      [],
      items,
      item.created_time,
      item.item_updated_time,
      item.currency,
      item.occured_at
    );
    bill.id = item.id;
    const members: BillMember[] = [];
    item.members.forEach((m) => {
      let newMember = new BillMember(m.name, bill, m.id);
      let user: User | undefined;

      if (m.linked_user) {
        user = new User(m.linked_user.id, m.linked_user.username);
        newMember.bindUser(user);
      }
      members.push(newMember);
    });
    bill.members = members;
    return bill;
  });
}
