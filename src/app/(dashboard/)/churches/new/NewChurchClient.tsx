"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapView } from "@/components/map/MapView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { churchCreateSchema } from "@/lib/validation/church";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MapPinIcon, MapPinCheckIcon } from "lucide-react";
import maplibregl from "maplibre-gl";

const DENOMINATIONS = [
  { value: "catholic", label: "Catholic" },
  { value: "protestant", label: "Protestant" },
  { value: "orthodox", label: "Orthodox" },
  { value: "other", label: "Other" },
  { value: "ecumenical", label: "Ecumenical" }
] as const;

const STYLES = [
  "gothic", "romanesque", "baroque", "neoclassical", "modern",
  "brutalist", "byzantine", "renaissance", "art_nouveau", "other"
] as const;

interface NewChurchClientProps {
  groupId?: string;
}

export function NewChurchClient({ groupId }: NewChurchClientProps) {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [pinPosition, setPinPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapClickMode, setMapClickMode] = useState(false);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  const form = useForm({
    resolver: zodResolver(churchCreateSchema),
    defaultValues: {
      name: "",
      denomination: undefined,
      address: "",
      yearBuilt: undefined,
      architecturalStyle: undefined,
      website: "",
      serviceTimes: "",
      description: "",
      patronSaint: "",
      heritageStatus: "none",
      organBuilder: "",
      organSpecs: "",
      capacity: undefined,
      wheelchairAccessible: false,
      parkingInfo: "",
      virtualTourUrl: "",
      groupId
    }
  });

  const createChurch = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/churches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create church");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Church added");
      router.push(`/groups/${groupId || "public"}/churches/${data.church.id}`);
    },
    onError: () => toast.error("Failed to add church")
  });

  const onSubmit = form.handleSubmit((data) => {
    if (!pinPosition) { toast.error("Please place a pin on the map first"); return; }
    createChurch.mutate({ ...data, lat: pinPosition.lat, lng: pinPosition.lng });
  });

  // Initialize map for pin placement
  useEffect(() => {
    if (!mapContainerRef.current || map) return;

    const newMap = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [19.0402, 47.4979], // Hungary center
      zoom: 7,
      attributionControl: false
    });

    newMap.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add pin image
    if (!newMap.hasImage("pin")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#c66b4b";
      ctx.beginPath();
      ctx.moveTo(24, 4);
      ctx.bezierCurveTo(24, 4, 4, 4, 4, 22);
      ctx.bezierCurveTo(4, 22, 24, 40, 24, 40);
      ctx.bezierCurveTo(24, 40, 44, 22, 44, 22);
      ctx.bezierCurveTo(44, 22, 24, 4, 24, 4);
      ctx.fill();
      const imageData = ctx.getImageData(0, 0, 48, 48);
      newMap.addImage("pin", imageData, { sdf: false });
    }

    setMap(newMap);

    return () => {
      newMap.remove();
    };
  }, []);

  // Handle map clicks for pin placement
  useEffect(() => {
    if (!map || !mapClickMode) return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const coords = e.lngLat;
      setPinPosition({ lat: coords.lat, lng: coords.lng });
      setMapClickMode(false);

      // Reverse geocode to get address
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) {
            form.setValue("address", data.display_name);
          }
        })
        .catch(() => {});
    };

    map.on("click", handleClick);
    map.getCanvas().style.cursor = "crosshair";

    return () => {
      map.off("click", handleClick);
      map.getCanvas().style.cursor = "";
    };
  }, [map, mapClickMode, form]);

  // Update pin marker when position changes
  useEffect(() => {
    if (!map) return;

    if (pinPosition) {
      if (map.getSource("pin")) {
        (map.getSource("pin") as maplibregl.GeoJSONSource).setData({
          type: "Feature",
          geometry: { type: "Point", coordinates: [pinPosition.lng, pinPosition.lat] },
          properties: {}
        });
      } else {
        map.addSource("pin", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "Point", coordinates: [pinPosition.lng, pinPosition.lat] },
            properties: {}
          }
        });
        map.addLayer({
          id: "pin-marker",
          type: "symbol",
          source: "pin",
          layout: {
            "icon-image": "pin",
            "icon-allow-overlap": true,
            "icon-size": 1
          }
        });
      }
      map.flyTo({ center: [pinPosition.lng, pinPosition.lat], zoom: 16 });
    } else {
      if (map.getLayer("pin-marker")) map.removeLayer("pin-marker");
      if (map.getSource("pin")) map.removeSource("pin");
    }
  }, [map, pinPosition]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 border-b">
        <h1 className="font-serif text-2xl font-semibold">Add New Church</h1>
        <p className="text-sm text-muted-foreground">Place a pin on the map, then fill in the details</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Form sidebar */}
        <div className={cn("w-full lg:w-96 flex-shrink-0 border-r p-4 overflow-y-auto", "bg-card")}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...form.register("name", { required: true })} className="mt-1" />
            </div>

            <div>
              <Label>Denomination</Label>
              <Select {...form.register("denomination")}>
                <SelectTrigger className="mt-1 w-full"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {DENOMINATIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...form.register("address")} className="mt-1" placeholder="Auto-filled from pin" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input id="yearBuilt" type="number" min="0" max={new Date().getFullYear()} {...form.register("yearBuilt", { valueAsNumber: true })} className="mt-1" />
              </div>
              <div>
                <Label>Architectural Style</Label>
                <Select {...form.register("architecturalStyle")}>
                  <SelectTrigger className="mt-1 w-full"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} rows={3} className="mt-1" />
            </div>

            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium text-sm">Additional Details (Optional)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="patronSaint">Patron Saint</Label>
                  <Input id="patronSaint" {...form.register("patronSaint")} className="mt-1" />
                </div>
                <div>
                  <Label>Heritage Status</Label>
                  <Select {...form.register("heritageStatus")}>
                    <SelectTrigger className="mt-1 w-full"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="unesco">UNESCO</SelectItem>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="organBuilder">Organ Builder</Label>
                  <Input id="organBuilder" {...form.register("organBuilder")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="organSpecs">Organ Specs</Label>
                  <Input id="organSpecs" {...form.register("organSpecs")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" type="number" min="1" {...form.register("capacity", { valueAsNumber: true })} className="mt-1" />
                </div>
                <div className="flex items-end">
                  <div className="flex h-10 items-center">
                    <input type="checkbox" {...form.register("wheelchairAccessible")} className="h-4 w-4 rounded border-border" />
                  </div>
                  <Label className="ml-2 text-sm">Wheelchair Accessible</Label>
                </div>
                <div>
                  <Label htmlFor="parkingInfo">Parking Info</Label>
                  <Input id="parkingInfo" {...form.register("parkingInfo")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="virtualTourUrl">Virtual Tour URL</Label>
                  <Input id="virtualTourUrl" type="url" {...form.register("virtualTourUrl")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" type="url" {...form.register("website")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="serviceTimes">Service Times</Label>
                  <Input id="serviceTimes" {...form.register("serviceTimes")} className="mt-1" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={createChurch.isPending || !pinPosition}>
                {createChurch.isPending ? "Saving..." : "Add Church"}
              </Button>
            </div>
          </form>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="absolute inset-0" />
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <Button
              variant={mapClickMode ? "default" : "outline"}
              onClick={() => setMapClickMode(!mapClickMode)}
              className="gap-2"
              disabled={!map}
            >
              <MapPinIcon className="w-4 h-4" />
              {mapClickMode ? "Click map to place pin" : "Enable pin placement"}
            </Button>
          </div>
          {pinPosition && (
            <div className="absolute top-4 left-4 right-4 flex justify-center">
              <div className="bg-green-600/90 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                <MapPinCheckIcon className="w-4 h-4" />
                Pin placed: {pinPosition.lat.toFixed(5)}, {pinPosition.lng.toFixed(5)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}