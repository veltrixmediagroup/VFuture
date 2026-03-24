"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserItem, UserRole } from "@/lib/types/content";

type UserRoleTableProps = {
  users: UserItem[];
  onSaved: () => Promise<void>;
};

export function UserRoleTable({ users, onSaved }: UserRoleTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateRole = async (id: string, role: UserRole) => {
    setUpdatingId(id);
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, role }),
    });

    if (!response.ok) {
      setUpdatingId(null);
      toast.error("KHÔNG THỂ CẬP NHẬT QUYỀN.");
      return;
    }

    toast.success("ĐÃ CẬP NHẬT QUYỀN.");
    setUpdatingId(null);
    await onSaved();
  };

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 uppercase tracking-[0.08em]">EMAIL</th>
            <th className="px-4 py-3 uppercase tracking-[0.08em]">QUYỀN</th>
            <th className="px-4 py-3 uppercase tracking-[0.08em]">LƯỢT XEM</th>
            <th className="px-4 py-3 uppercase tracking-[0.08em]">TRẠNG THÁI</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-border text-foreground">
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">
                <Select defaultValue={user.role} onValueChange={(value) => updateRole(user.id, value as UserRole)}>
                  <SelectTrigger className="h-9 w-40 border-border bg-background uppercase tracking-[0.08em] text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card text-foreground">
                    <SelectItem value="admin" className="uppercase tracking-[0.08em]">
                      QUẢN TRỊ
                    </SelectItem>
                    <SelectItem value="editor" className="uppercase tracking-[0.08em]">
                      BIÊN TẬP
                    </SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3">{user.views.toLocaleString("vi-VN")}</td>
              <td className="px-4 py-3">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updatingId === user.id}
                  className="border-border bg-background text-foreground"
                >
                  {updatingId === user.id ? "ĐANG CẬP NHẬT..." : "ĐÃ ĐỒNG BỘ"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
