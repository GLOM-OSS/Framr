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
  const [mandatoryDPoints, setMandatoryDPoints] = useState<DPoint[]>();

  const eventBus = new EventBus();

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
    setIsSelected((prev) => !prev);
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

  useEffect(() => {
    const dpointsService = new DPointsService();

    function fetchToolMandatoryDpoints() {
      eventBus.once<DPoint[]>(
        DPointsEventChannel.FIND_ALL_DPOINT_CHANNEL,
        ({ data, status }) => {
          if (status === EventBusChannelStatus.SUCCESS) {
            setMandatoryDPoints((prev) => prev ?? data);
          }
        }
      );
      dpointsService.findAll({ toolId: tool.id, mandatory: true });
    }

    if (isOpen) fetchToolMandatoryDpoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function removeNewDPointsFromPrevList(
    prevSelectedDPoints: DPoint[],
    newSelectedDPoints: DPoint[]
  ) {
    const tt = prevSelectedDPoints.filter(({ id }) => {
      return !newSelectedDPoints.map(({ id }) => id).includes(id);
    });
    return [...tt, ...newSelectedDPoints];
  }

  function handleSelectService(service: Service) {
    const serviceDpoints = service.dpoints;
    const concernedServiceDPointIds = serviceDpoints.map(({ id }) => id);
    const tt = concernedServiceDPointIds.map((serviceDPointId) =>
      selectedDPoints.map(({ id }) => id).includes(serviceDPointId)
    );
    setSelectedDPoints((prev) => {
      setPrevSelectedDPoints(prev);
      if (tt.includes(false)) {
        //MEANS SERVICE WAS NO SELECTED
        return removeNewDPointsFromPrevList(prev, serviceDpoints);
      } else {
        return prev.filter(({ id }) => !concernedServiceDPointIds.includes(id));
      }
    });
  }

  useEffect(() => {
    function removePreviousMandatoryDPoints(
      selectedDPoints: DPoint[],
      mandatoryDPoints: DPoint[]
    ) {
      return selectedDPoints.filter((dpoint) => {
        return !mandatoryDPoints.map(({ id }) => id).includes(dpoint.id);
      });
    }

    if (mandatoryDPoints) {
      if (isSelected) {
        setSelectedDPoints((prev) => {
          setPrevSelectedDPoints(prev);
          return [
            ...removePreviousMandatoryDPoints(prev, mandatoryDPoints),
            ...mandatoryDPoints,
          ];
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

  useEffect(() => {
    getDPoints(selectedDPoints, prevSelectedDPoints);

    setIsSelected(() => {
      if (!mandatoryDPoints || !mandatoryDPoints.length) return false;
      const mandatoryDpointIds = mandatoryDPoints.map(({ id }) => id);
      const tt = mandatoryDpointIds.map((id) =>
        selectedDPoints.map(({ id }) => id).includes(id)
      );
      return !tt.includes(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDPoints]);

  return (
    <Box>
      <ToolCard
        name={`${tool.name} (${tool.version})`}
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
              isSelected={(() => {
                const serviceDpointIds = service.dpoints.map(({ id }) => id);
                const tt = serviceDpointIds.map((id) =>
                  selectedDPoints.map(({ id }) => id).includes(id)
                );
                return !tt.includes(false);
              })()}
            />
          </Box>
        ))}
    </Box>
  );
}
