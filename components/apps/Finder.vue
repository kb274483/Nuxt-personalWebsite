<template>
  <div class="h-full flex flex-col">
    <div class="h-10 bg-gray-100 border-b flex items-center px-4 space-x-4">
      <div class="flex space-x-2 text-gray-500">
        <button class="hover:text-black">&lt;</button>
        <button class="hover:text-black">&gt;</button>
      </div>
      <div class="font-semibold text-sm">Finder</div>
    </div>
    <div class="flex-1 flex">

      <div class="w-40 bg-gray-50/80 border-r p-2 space-y-1">
        <div class="text-xs font-bold text-gray-400 px-2 mb-1">Favorites</div>
        <div class="px-2 py-1 rounded hover:bg-gray-200 cursor-pointer text-sm flex items-center space-x-2">
            <span>🏠</span> <span>Home</span>
        </div>
        <div class="px-2 py-1 rounded hover:bg-gray-200 cursor-pointer text-sm flex items-center space-x-2">
            <span>🖥️</span> <span>Desktop</span>
        </div>
        <div class="px-2 py-1 rounded hover:bg-gray-200 cursor-pointer text-sm flex items-center space-x-2">
            <span>📂</span> <span>Documents</span>
        </div>
        <div class="px-2 py-1 rounded hover:bg-gray-200 cursor-pointer text-sm flex items-center space-x-2">
            <span>⬇️</span> <span>Downloads</span>
        </div>
      </div>
      <div class="flex-1 bg-white p-4 grid grid-cols-4 gap-4 content-start">
        <div class="flex flex-col items-center group cursor-pointer">
            <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-2xl group-hover:bg-blue-200">📂</div>
            <span class="text-xs mt-1 text-center group-hover:bg-blue-600 group-hover:text-white rounded px-1">Projects</span>
        </div>
        <div class="flex flex-col items-center group cursor-pointer">
            <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl group-hover:bg-gray-200">📄</div>
            <span class="text-xs mt-1 text-center group-hover:bg-blue-600 group-hover:text-white rounded px-1">Resume.pdf</span>
        </div>
      </div>
    </div>
  </div>
</template>
