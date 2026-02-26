import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function BookmarkCard({ 
  title, 
  desc, 
  url, 
  imageUrl, 
  favicon, 
  domain, 
  createdAt 
}) {
  
  const formattedDate = createdAt 
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
    : '';

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      // Fixed height 'h-[380px]' hata diya, ab ye content ke hisaab se adjust hoga
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full shadow-sm"
    >
      {/* 1. IMAGE SECTION */}
      <div className="h-44 bg-slate-100 relative overflow-hidden shrink-0 border-b border-slate-200/50">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-200 font-bold text-xl italic">
            OopsMarked
          </div>
        )}
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="p-4 flex flex-col flex-1 min-h-0">
        
        {/* Favicon + Title */}
        <div className="flex items-start gap-2.5 mb-2">
          <div className="w-5 h-5 mt-1 shrink-0 flex items-center justify-center bg-white rounded shadow-sm border border-slate-100 overflow-hidden">
            {favicon ? (
              <img src={favicon} alt="" className="w-full h-full object-contain" />
            ) : (
              <span className="text-xs">🌐</span>
            )}
          </div>
          
          <h3 className="font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors text-[15px]">
            {title || domain || 'Untitled Mark'}
          </h3>
        </div>

        {/* Description */}
        <p className="text-[13px] text-slate-500 line-clamp-3 leading-relaxed mb-4">
          {desc || "No description available for this page."}
        </p>

        {/* 3. FOOTER SECTION - Alag se padding-top dekar bottom mein push kiya */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto bg-white">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
            {domain}
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            {formattedDate}
          </span>
        </div>
      </div>
    </a>
  );
}