"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  body: z.string().min(10, "Story body must be at least 10 characters."),
  categoryId: z.string().min(1, "Please select a category"),
  isFeatured: z.boolean(),
  ageRangeMin: z.number().min(0).max(18),
  ageRangeMax: z.number().min(0).max(18),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export function StoryEditorForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(console.error);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      body: "",
      categoryId: "",
      isFeatured: false,
      ageRangeMin: 3,
      ageRangeMax: 8,
      status: "DRAFT",
    },
  });

  async function handleFileUpload(file: File, folder: "covers" | "audio") {
    try {
      // 1. Get presigned URL
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          folder,
        }),
      });
      const { uploadUrl, publicUrl, key } = await res.json();

      // 2. Upload to Cloudflare R2
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      return { publicUrl, key };
    } catch (error) {
      console.error(`Error uploading ${folder}:`, error);
      throw error;
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // Stub: in a real implementation we would:
      // 1. Upload cover and audio via `handleFileUpload`
      // 2. Save the metadata responses into `MediaAsset` records via an API
      // 3. Attach those `MediaAsset` IDs to this payload

      const response = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to save story");

      router.push("/admin/stories");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Story Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. The Magic Treehouse"
                          {...field}
                          className="text-lg font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="A brief summary for the card view..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Story Body</FormLabel>
                      <FormDescription className="text-xs">
                        Write the full story content here. This is what readers
                        will see.
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="Once upon a time, in a land far, far away..."
                          {...field}
                          className="min-h-[300px] text-base leading-relaxed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-6">
                <h3 className="text-lg font-bold">Media</h3>

                {/* Cover Image Upload Stub */}
                <div>
                  <FormLabel className="mb-2 block">Cover Image</FormLabel>
                  <div
                    className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => coverInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      setCoverFile(e.dataTransfer.files?.[0] || null);
                    }}
                  >
                    <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">
                      Click or drag image to upload
                    </p>
                    <input
                      type="file"
                      ref={coverInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        setCoverFile(e.target.files?.[0] || null)
                      }
                    />
                    {coverFile && (
                      <p className="text-xs text-primary mt-2 font-bold">
                        {coverFile.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Audio File Upload Stub */}
                <div>
                  <FormLabel className="mb-2 block">
                    Narration Audio (MP3/WAV)
                  </FormLabel>
                  <div
                    className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => audioInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      setAudioFile(e.dataTransfer.files?.[0] || null);
                    }}
                  >
                    <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">
                      Click or drag audio file to upload
                    </p>
                    <input
                      type="file"
                      ref={audioInputRef}
                      className="hidden"
                      accept="audio/*"
                      onChange={(e) =>
                        setAudioFile(e.target.files?.[0] || null)
                      }
                    />
                    {audioFile && (
                      <p className="text-xs text-primary mt-2 font-bold">
                        {audioFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Story</FormLabel>
                        <FormDescription className="text-xs">
                          Highlight on the homepage
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="ageRangeMin"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Age Min</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className="text-muted-foreground mt-8">-</span>
                  <FormField
                    control={form.control}
                    name="ageRangeMax"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Age Max</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="font-bold shadow-md"
          >
            {loading ? "Saving..." : "Save Story"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
