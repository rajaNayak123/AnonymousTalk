"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { verifySchema } from "@/schemas/verifySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams();

  // Ensure params.username exists
  // const username = params?.username;
  const username = params?.username as string | undefined;

  if (!username) {
    toast.error("Invalid verification link.");
    return null;
  }

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  // const onSubmit = async (data: z.infer<typeof verifySchema>) => {
  //   try {
  //     const response = await axios.get<ApiResponse>(`/api/verify?username=${encodeURIComponent(username)}&code=${data.code}`);

  //     toast("Success", { description: response.data.message });
  //     router.replace("/sign-in");
  //   } catch (error) {
  //     const axiosError = error as AxiosError<ApiResponse>;
  //     toast("Verification Failed", {
  //       description:
  //         axiosError.response?.data.message ??
  //         "An error occurred. Please try again.",
  //     });
  //   }
  // };

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.get<ApiResponse>(
        `/api/verify-code?username=${encodeURIComponent(username)}&code=${data.code}`
      );

      toast.success(response.data.message);
      router.replace("/sign-in");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ??
          "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="cursor-pointer" type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
