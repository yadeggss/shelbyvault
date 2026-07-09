"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const SEVERITY_OPTIONS = ["rug", "drain", "theft", "suspicious"];

export default function UploadPage() {
  const { account, connected } = useWallet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("suspicious");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem("shelbyvault-draft");
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setTitle(draft.title || "");
        setDescription(draft.description || "");
        setSeverity(draft.severity || "suspicious");
        setVisibility(draft.visibility || "public");
        setTags(draft.tags || []);
      } catch {}
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    const draft = { title, description, severity, visibility, tags };
    localStorage.setItem("shelbyvault-draft", JSON.stringify(draft));
  }, [title, description, severity, visibility, tags]);

  function addTag() {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!connected || !account) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!title) {
      alert("Please add a title.");
      return;
    }

    setSubmitting(true);

    try {
      let blobUrls: string[] = [];

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          alert("File upload to Shelby failed. Try again.");
          setSubmitting(false);
          return;
        }

        const uploadData = await uploadRes.json();
        blobUrls = uploadData.blobUrls;
      }

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          severity,
          visibility,
          ownerWallet: account.address.toString(),
          blobUrls,
          tags,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.removeItem("shelbyvault-draft");
        window.location.href = `/case/${data.id}`;
      } else {
        alert("Failed to submit case. Try again.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Check the console.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submit Evidence</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload proof of rugs, wallet drains, theft, or suspicious onchain activity.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Case Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="e.g. $PEPE dev drained liquidity pool"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe what happened, include wallet addresses, transaction hashes, timestamps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Severity</label>
            <div className="flex gap-2 flex-wrap">
              {SEVERITY_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors capitalize ${
                    severity === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Visibility</label>
            <div className="flex gap-2">
              {["public", "private"].map((v) => (
                <button
                  key={v}
                  onClick={() => setVisibility(v as "public" | "private")}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors capitalize ${
                    visibility === v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-foreground"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. solana, memecoin, wallet-drain"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
              />
              <Button variant="outline" size="icon" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragging ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop files here, or{" "}
              <label className="text-primary cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                  accept="image/*,video/*,.pdf,.txt"
                />
              </label>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Images, videos, PDFs, text files
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent text-sm"
                >
                  <span className="truncate">{file.name}</span>
                  <button onClick={() => removeFile(i)}>
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleSubmit}
        className="w-full"
        size="lg"
        disabled={submitting}
      >
        {submitting ? "Uploading to ShelbyVault..." : "Submit to ShelbyVault"}
      </Button>
    </div>
  );
}