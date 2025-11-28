<template>
  <div class="h-full flex flex-col bg-white">

    <div class="h-10 bg-gray-100 border-b flex items-center px-4 justify-between">
       <span class="font-semibold">Photos</span>
       <div class="text-sm text-gray-500">Library</div>
    </div>

    <div class="flex-1 p-4 grid grid-cols-3 gap-2 overflow-auto content-start">
       <div class="aspect-square bg-gray-200 rounded hover:opacity-80 cursor-pointer flex items-center justify-center text-gray-400">1</div>
       <div class="aspect-square bg-gray-200 rounded hover:opacity-80 cursor-pointer flex items-center justify-center text-gray-400">2</div>
       <div class="aspect-square bg-gray-200 rounded hover:opacity-80 cursor-pointer flex items-center justify-center text-gray-400">3</div>
       <div class="aspect-square bg-gray-200 rounded hover:opacity-80 cursor-pointer flex items-center justify-center text-gray-400">4</div>
       <div class="aspect-square bg-gray-200 rounded hover:opacity-80 cursor-pointer flex items-center justify-center text-gray-400">5</div>
    </div>
  </div>
</template>
