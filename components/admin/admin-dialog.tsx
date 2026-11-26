"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/dialog";

export type AdminDialogField = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
};

export function AdminDialog({
  open,
  title,
  description,
  fields = [],
  confirmLabel = "Confirm",
  danger = false,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description?: string;
  fields?: AdminDialogField[];
  confirmLabel?: string;
  danger?: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  // Reset the draft on each open, without clearing edits when the parent refreshes.
  useEffect(() => {
    if (open)
      setValues(
        Object.fromEntries(
          fields.map((field) => [field.name, field.defaultValue || ""]),
        ),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, title]);

  return (
    <Dialog
      open={open}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      danger={danger}
      onClose={onClose}
      onSubmit={() => onSubmit(values)}
    >
      {!!fields.length && (
        <div className="mt-5 space-y-4">
          {fields.map((field) => {
            const props = {
              className: "field",
              required: field.required,
              value: values[field.name] || "",
              onChange: (
                event: React.ChangeEvent<
                  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                >,
              ) =>
                setValues((current) => ({
                  ...current,
                  [field.name]: event.target.value,
                })),
            };
            return (
              <label key={field.name} className="block">
                <span className="label">{field.label}</span>
                {field.type === "select" ? (
                  <select {...props}>
                    {field.options?.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    {...props}
                    rows={3}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    {...props}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                  />
                )}
              </label>
            );
          })}
        </div>
      )}
    </Dialog>
  );
}
