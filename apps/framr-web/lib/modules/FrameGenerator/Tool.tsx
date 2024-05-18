import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  DPointsEventChannel,
  DPointsService,
  ServicesEventChannel,
  ServicesService,
} from '../../services';
import { EventBus, EventBusChannelStatus } from '../../services/libs/event-bus';
import { DPoint, GeneratorConfigTool, Service } from '../../types';
import { ToolCard } from './ToolCard';
interface ToolProps {
  tool: GeneratorConfigTool;
  getDPoints: (
    selectedDPoints: DPoint[],
    prevSelectedDPoints: DPoint[]
  ) => void;
}
export default function Tool({ tool, getDPoints }: ToolProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>();
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [prevSelectedDPoints, setPrevSelectedDPoints] = useState<DPoint[]>([]);
  const [selectedDPoints, setSelectedDPoints] = useState<DPoint[]>([]);
  const [prevMandatoryDPoints, setPrevMandatoryDPoints] = useState<DPoint[]>();
  const [mandatoryDPoints, setMandatoryDPoints] = useState<DPoint[]>();
  const [prevSelectedServices, setPrevSelectedServices] = useState<Service[]>(
    []
  );
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  const eventBus = new EventBus();
  const dpointsService = new DPointsService();
  function fetchToolMandatoryDpoints() {
    eventBus.once<DPoint[]>(
      DPointsEventChannel.FIND_ALL_DPOINT_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          const mandDpoints = mandatoryDPoints ?? data;
          if (!mandatoryDPoints)
            setMandatoryDPoints((prev) => {
              setPrevMandatoryDPoints(prev);
              return mandDpoints;
            });
        }
      }
    );
    dpointsService.findAll({ toolId: tool.id, mandatory: true });
  }

  const servicesService = new ServicesService();
  function fetchToolServices() {
    eventBus.once<Service[]>(
      ServicesEventChannel.FIND_ALL_SERVICES_CHANNEL,
      ({ data, status }) => {
        if (status === EventBusChannelStatus.SUCCESS) {
          setServices(data);
        }
      }
    );
    servicesService.findAll(tool.id);
  }

  function handleSelectTool() {
    setIsSelected((prev) => {
      fetchToolMandatoryDpoints();
      return !prev;
    });
    if (!isOpen) setIsOpen(true);
    if (!services) {
      fetchToolServices();
    }
  }

  function handleOpenTool() {
    setIsOpen((prev) => !prev);
    if (!services) {
      fetchToolServices();
    }
  }

  function handleSelectService(service: Service) {
    if (selectedServices.map(({ id }) => id).includes(service.id)) {
      setSelectedServices((prev) => {
        setPrevSelectedServices(prev);
        return prev.filter(({ id }) => id !== service.id);
      });
    } else {
      setSelectedServices((prev) => {
        setPrevSelectedServices(prev);
        return [...prev, service];
      });
    }
  }

  useEffect(() => {
    function removePrevServicesSelectedDPoints(selectedDPoints: DPoint[]) {
      return selectedDPoints.filter((dpoint) => {
        return !prevSelectedServices
          .map(({ dpoints }) => dpoints)
          .flat()
          .map(({ id }) => id)
          .includes(dpoint.id);
      });
    }

    const newSelectedDPoints = selectedServices
      .map(({ dpoints }) => dpoints)
      .flat();

    setSelectedDPoints((prev) => {
      setPrevSelectedDPoints(prev);
      return [
        ...newSelectedDPoints,
        ...removePrevServicesSelectedDPoints(prev),
      ];
    });
    getDPoints(selectedDPoints, prevSelectedDPoints);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServices]);

  useEffect(() => {
    function removePreviousMandatoryDPoints(selectedDPoints: DPoint[]) {
      if (!prevMandatoryDPoints) return selectedDPoints;
      return selectedDPoints.filter((dpoint) => {
        return !prevMandatoryDPoints.map(({ id }) => id).includes(dpoint.id);
      });
    }

    if (mandatoryDPoints) {
      if (isSelected) {
        setSelectedDPoints((prev) => {
          setPrevSelectedDPoints(prev);
          return [...removePreviousMandatoryDPoints(prev), ...mandatoryDPoints];
        });
      } else {
        setSelectedDPoints((prev) => {
          setPrevSelectedDPoints(prev);
          return prev.filter((dpoint) => {
            return !mandatoryDPoints.map(({ id }) => id).includes(dpoint.id);
          });
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected, mandatoryDPoints]);

  return (
    <Box>
      <ToolCard
        name={tool.name}
        isOpen={isOpen}
        handleSelect={handleSelectTool}
        isSelected={isSelected}
        handleOpen={handleOpenTool}
      />
      {isOpen &&
        (services ?? []).map((service, index) => (
          <Box key={index} pl={5}>
            <ToolCard
              name={service.name}
              handleSelect={() => handleSelectService(service)}
              isSelected={selectedServices
                .map(({ id }) => id)
                .includes(service.id)}
            />
          </Box>
        ))}
    </Box>
  );
}
