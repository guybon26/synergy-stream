
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, MapPin, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LogisticsData } from '@/types/synergia';

// Sample site location data with properly typed coordinates
const sitesData = [
  { 
    id: 'SITE001', 
    name: 'Northeast Medical Center', 
    location: [-73.9857, 40.7484] as [number, number], // NYC
    status: 'active',
    patients: 32,
    inventory: 'ok'
  },
  { 
    id: 'SITE002', 
    name: 'Pacific Research Institute', 
    location: [-122.4194, 37.7749] as [number, number], // San Francisco
    status: 'warning',
    patients: 28,
    inventory: 'critical'
  },
  { 
    id: 'SITE003', 
    name: 'Midwest Clinical Center', 
    location: [-87.6298, 41.8781] as [number, number], // Chicago
    status: 'active',
    patients: 41,
    inventory: 'warning'
  },
  { 
    id: 'SITE004', 
    name: 'Southern Medical Research', 
    location: [-95.3698, 29.7604] as [number, number], // Houston
    status: 'active',
    patients: 23,
    inventory: 'ok'
  },
  { 
    id: 'SITE005', 
    name: 'Capital Region Hospital', 
    location: [-77.0369, 38.9072] as [number, number], // Washington DC
    status: 'active',
    patients: 35,
    inventory: 'ok'
  }
];

interface MapVisualizationProps {
  logisticsData?: LogisticsData[];
  isLoading?: boolean;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ 
  logisticsData = [],
  isLoading = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [activeLayer, setActiveLayer] = useState<string>('all');

  // Function to get site inventory status using logisticsData
  const getSiteInventoryStatus = (siteId: string) => {
    const siteLogistics = logisticsData.filter(item => item.siteId === siteId);
    if (siteLogistics.length === 0) return 'unknown';
    
    if (siteLogistics.some(item => item.status === 'critical')) return 'critical';
    if (siteLogistics.some(item => item.status === 'warning')) return 'warning';
    return 'ok';
  };

  // Function to get pin color based on status and active layer
  const getPinColor = (site: any) => {
    if (activeLayer === 'inventory' || activeLayer === 'all') {
      const inventoryStatus = logisticsData.length > 0 
        ? getSiteInventoryStatus(site.id) 
        : site.inventory;

      if (inventoryStatus === 'critical') return '#ef4444'; // red
      if (inventoryStatus === 'warning') return '#f97316'; // orange
      if (inventoryStatus === 'ok') return '#22c55e'; // green
    }
    
    if (activeLayer === 'enrollment' || activeLayer === 'all') {
      if (site.status === 'warning') return '#f97316'; // orange
    }
    
    return '#0066ff'; // synergia blue
  };

  useEffect(() => {
    // Prompt for Mapbox token if not set (in real app, this would be environment variable)
    if (!mapboxToken) {
      const token = prompt('Please enter your Mapbox public token:');
      if (token) {
        setMapboxToken(token);
      } else {
        console.error('Mapbox token is required to display the map');
        return;
      }
    }

    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-95.7129, 37.0902], // Center of US
      zoom: 3,
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add pins for each site when map loads
    map.current.on('load', () => {
      sitesData.forEach(site => {
        // Create a marker element
        const el = document.createElement('div');
        el.className = 'site-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.backgroundSize = 'contain';
        el.style.cursor = 'pointer';

        // Set initial pin color
        const color = getPinColor(site);
        el.style.backgroundColor = color;
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2)';

        // Create popup with site info
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="font-family: system-ui, sans-serif; padding: 8px;">
              <h3 style="margin: 0 0 8px; font-weight: 600;">${site.name}</h3>
              <p style="margin: 0 0 4px;"><strong>Site ID:</strong> ${site.id}</p>
              <p style="margin: 0 0 4px;"><strong>Patients:</strong> ${site.patients}</p>
              <p style="margin: 0 0 4px;"><strong>Inventory:</strong> ${logisticsData.length > 0 
                ? getSiteInventoryStatus(site.id) 
                : site.inventory}</p>
            </div>
          `);

        // Add marker to map with properly typed location
        new mapboxgl.Marker(el)
          .setLngLat(site.location)
          .setPopup(popup)
          .addTo(map.current!);
      });
    });

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Update markers when active layer changes
  useEffect(() => {
    if (!map.current) return;

    // Find all markers and update their appearance
    const markers = document.querySelectorAll('.site-marker');
    markers.forEach((marker, index) => {
      if (index < sitesData.length) {
        const site = sitesData[index];
        const color = getPinColor(site);
        (marker as HTMLElement).style.backgroundColor = color;
      }
    });
  }, [activeLayer, logisticsData]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold flex items-center">
            <MapPin className="mr-2 text-synergia-600" size={20} />
            Site Map
          </CardTitle>
          <div className="flex space-x-2">
            <Badge 
              variant={activeLayer === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveLayer('all')}
            >
              <Layers size={14} className="mr-1" />
              All Layers
            </Badge>
            <Badge 
              variant={activeLayer === 'inventory' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveLayer('inventory')}
            >
              <AlertTriangle size={14} className="mr-1" />
              Inventory Risk
            </Badge>
            <Badge 
              variant={activeLayer === 'enrollment' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveLayer('enrollment')}
            >
              <MapPin size={14} className="mr-1" />
              Enrollment Status
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-synergia-600"></div>
          </div>
        ) : (
          <div className="relative">
            <div ref={mapContainer} className="h-[400px] w-full rounded-b-lg" />
            <div className="absolute bottom-4 left-4 bg-white p-2 rounded-md shadow-md">
              <div className="text-xs font-semibold mb-1">Legend</div>
              <div className="flex items-center text-xs mb-1">
                <div className="w-3 h-3 rounded-full bg-[#22c55e] mr-1"></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center text-xs mb-1">
                <div className="w-3 h-3 rounded-full bg-[#f97316] mr-1"></div>
                <span>Warning</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-3 h-3 rounded-full bg-[#ef4444] mr-1"></div>
                <span>Critical</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapVisualization;
