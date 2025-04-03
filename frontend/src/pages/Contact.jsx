import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Contact() {
  return (
    <div className="p-4">
      <header className="mb-4 text-left">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 animate-fade-in-left">
          Contact Us
        </h1>
        <p className="text-gray-600 mb-4 animate-slide-up">
          Have questions, feedback, or need assistance? We'd love to hear from
          you.
        </p>
      </header>
      <div className="rounded-xl p-8 w-full max-w-3xl mx-auto space-y-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 animate-slide-up">
          Get in Touch
        </h2>
        <p className="text-gray-600 animate-slide-up">
          Please fill out the form below and one of our team members will get
          back to you as soon as possible.
        </p>
        <form className="space-y-4 animate-slide-up text-left">
          <div>
            <Label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-1"
            >
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-1"
            >
              Email
            </Label>
            <Input id="email" type="email" placeholder="Your email" />
          </div>
          <div>
            <Label
              htmlFor="message"
              className="block text-gray-700 font-medium mb-1"
            >
              Message
            </Label>
            <Textarea
              id="message"
              rows="5"
              placeholder="Your message"
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></Textarea>
          </div>
          <div className="text-left">
            <Button type="submit">Send Message</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
