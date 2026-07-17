import React from "react";

export default function RichTextWidget({ data }: { data: any }) {
  return (
    <section className="w-full max-w-4xl mx-auto py-8">
      {data.title && (
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059] mb-4 text-center">
          {data.title}
        </h3>
      )}
      <div 
        className="prose prose-invert prose-[#C5A059] max-w-none text-gray-300 leading-relaxed text-center sm:text-left"
        dangerouslySetInnerHTML={{ __html: data.content || "<p>Add your rich text content here...</p>" }}
      />
    </section>
  );
}
