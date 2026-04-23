import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Moon, Sun, BookOpenText, Grid, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DayDropZone } from './components/DayDropZone';
import { getWeekNumber, getWeekRangeAsString, getDaysOfCurrentWeek } from './lib/dateUtils';
import { ImageData } from './components/PolaroidCard';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [images, setImages] = useState<Record<number, ImageData[]>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notes, setNotes] = useState("");
  const [uploadingDays, setUploadingDays] = useState<number[]>([]);

  const weekNumber = getWeekNumber(currentDate);
  const year = currentDate.getFullYear();
  const dateRange = getWeekRangeAsString(currentDate);
  const daysOfCurrentWeek = getDaysOfCurrentWeek(currentDate);

  // Toggle theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load images and notes for current week
  useEffect(() => {
    fetchImages();
    const savedNotes = localStorage.getItem(`notes_${year}_${weekNumber}`);
    setNotes(savedNotes || "");
  }, [weekNumber, year]);

  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/images?week=${weekNumber}&year=${year}`);
      if (res.ok) {
        const data: any[] = await res.json();
        
        const grouped: Record<number, ImageData[]> = {};
        for (let i = 1; i <= 6; i++) grouped[i] = [];
        
        data.forEach(item => {
          let day = item.dayOfWeek;
          if (day === 0 || day === 6) day = 6; // Weekend (Sat=6, Sun=0 mapped to 6)
          if (!grouped[day]) grouped[day] = [];
          grouped[day].push({
            id: item.id,
            url: item.url,
            terminologies: item.terminologies
          });
        });
        setImages(grouped);
      }
    } catch (e) {
      console.error('Failed to fetch images', e);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem(`notes_${year}_${weekNumber}`, val);
  };

  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };
  
  const handleToday = () => {
      setCurrentDate(new Date());
  };

  const handleUpload = async (file: File, dayIndex: number) => {
    setUploadingDays(prev => [...prev, dayIndex]);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("weekNumber", weekNumber.toString());
    formData.append("year", year.toString());
    formData.append("dayOfWeek", dayIndex.toString());

    try {
      const res = await fetch("/api/images", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errType = await res.json();
        throw new Error(errType.error || "Failed to upload image");
      }
      await fetchImages(); 
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "An unexpected error occurred during upload.");
    } finally {
      setUploadingDays(prev => prev.filter(d => d !== dayIndex));
    }
  };

  const handleDeleteTerm = async (id: number, term: string) => {
    // Optimistic UI update
    let updatedTerms: string[] = [];
    
    setImages(prev => {
        const next = { ...prev };
        for (const day in next) {
            next[day] = next[day].map(img => {
                if (img.id === id) {
                    updatedTerms = img.terminologies.filter(t => t !== term);
                    return { ...img, terminologies: updatedTerms };
                }
                return img;
            });
        }
        return next;
    });

    // API Call
    try {
        await fetch(`/api/images/${id}/terminologies`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ terminologies: updatedTerms })
        });
    } catch(e) {
        console.error("Failed to delete term", e);
        // On failure, rollback (fetch fresh images)
        fetchImages();
    }
  };

  const handleDeleteImage = async (id: number) => {
    try {
       const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
       if (res.ok) {
           await fetchImages();
       }
    } catch(e) {
        console.error(e);
    }
  };

  const DAYS_ROW_1 = [
    { Name: 'MON', id: 1, date: daysOfCurrentWeek[0].getDate() },
    { Name: 'TUE', id: 2, date: daysOfCurrentWeek[1].getDate() },
    { Name: 'WED', id: 3, date: daysOfCurrentWeek[2].getDate() }
  ];
  const DAYS_ROW_2 = [
    { Name: 'THU', id: 4, date: daysOfCurrentWeek[3].getDate() },
    { Name: 'FRI', id: 5, date: daysOfCurrentWeek[4].getDate() },
    { Name: 'SAT / SUN', id: 6, date: `${daysOfCurrentWeek[5].getDate()} - ${daysOfCurrentWeek[6].getDate()}` }
  ];

  return (
    <div className="min-h-screen font-sans selection:bg-amber-200 dark:selection:bg-amber-900 pb-20 relative">
      <Toaster />
      <header className="sticky top-0 z-50 bg-[#fcfcfc]/90 dark:bg-[#1a1510]/90 backdrop-blur-md border-b border-gray-200 dark:border-neutral-800">
        <div className="mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-hand tracking-tight text-neutral-800 dark:text-neutral-200 font-semibold">
                    Week {weekNumber}
                </h1>
                <div className="w-px h-6 bg-gray-300 dark:bg-neutral-700"></div>
                <span className="text-sm font-medium text-neutral-500">{dateRange}</span>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center">
                <div className="flex items-center bg-gray-50 dark:bg-neutral-800 rounded-md shadow-sm border border-gray-200 dark:border-neutral-700">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none rounded-l-md hover:bg-gray-200 dark:hover:bg-neutral-700 active:bg-gray-300" onClick={handlePrevWeek}>
                        <ChevronLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                    </Button>
                    <div className="h-8 border-l border-gray-200 dark:border-neutral-700"></div>
                    <Button variant="ghost" className="h-8 px-4 rounded-none hover:bg-gray-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300" onClick={handleToday}>
                         Today
                    </Button>
                    <div className="h-8 border-l border-gray-200 dark:border-neutral-700"></div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none rounded-r-md hover:bg-gray-200 dark:hover:bg-neutral-700 active:bg-gray-300" onClick={handleNextWeek}>
                        <ChevronRight className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                    </Button>
                </div>
            </div>
        </div>
      </header>
      
      {/* Floating Action Bar */}
      <div className="fixed right-6 top-24 z-40 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 flex flex-col p-2 gap-2">
           <Button variant="ghost" size="icon" className="h-10 w-10 text-neutral-600 dark:text-neutral-300 rounded-md">
               <Grid className="w-5 h-5" />
           </Button>
           <Button 
               variant="ghost" 
               size="icon" 
               className="h-10 w-10 text-neutral-600 dark:text-neutral-300 rounded-md"
               onClick={() => setIsDarkMode(!isDarkMode)}
           >
               {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
           </Button>
           <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
           <Button variant="ghost" size="icon" className="h-10 w-10 text-neutral-600 dark:text-neutral-300 rounded-md cursor-not-allowed">
               <Download className="w-5 h-5" />
           </Button>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* ROW 1: Mon, Tue, Wed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DAYS_ROW_1.map(day => (
            <div key={day.Name}>
                <DayDropZone 
                  dayName={day.Name}
                  dayDate={day.date}
                  dayIndex={day.id} 
                  images={images[day.id] || []} 
                  onUpload={handleUpload}
                  isUploading={uploadingDays.includes(day.id)}
                  onDeleteTerm={handleDeleteTerm}
                  onDeleteImage={handleDeleteImage}
                />
            </div>
          ))}
        </div>

        {/* ROW 2: Thu, Fri, Weekend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DAYS_ROW_2.map(day => (
           <div key={day.Name}>
              <DayDropZone 
                dayName={day.Name}
                dayDate={day.date}
                dayIndex={day.id} 
                images={images[day.id] || []} 
                onUpload={handleUpload}
                isUploading={uploadingDays.includes(day.id)}
                onDeleteTerm={handleDeleteTerm}
                onDeleteImage={handleDeleteImage}
              />
            </div>
          ))}
        </div>

        {/* Full Width Notes */}
        <div className="flex items-start mt-8 gap-4 px-2">
           <div className="flex items-center gap-2 mt-4 opacity-50">
               <BookOpenText className="w-4 h-4" />
               <h3 className="font-sans text-sm font-bold tracking-widest uppercase">Notes</h3>
           </div>
           <div className="flex-1 w-full group overflow-hidden">
               <textarea 
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Type notes / observations..."
                  className="w-full min-h-[150px] resize-y bg-transparent font-hand text-2xl text-neutral-800 dark:text-neutral-200 p-4 leading-[loose] outline-none"
               />
           </div>
        </div>

      </main>
    </div>
  );
}

