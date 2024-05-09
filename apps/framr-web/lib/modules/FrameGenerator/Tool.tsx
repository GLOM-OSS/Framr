import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { DPoint, IGeneratorConfigTool, Service } from '../../types';
import { ToolEnum } from '../../types/enums';
import { ToolCard } from './ToolCard';
interface ToolProps {
  tool: IGeneratorConfigTool;
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

  function fetchToolMandatoryDpoints(): DPoint[] {
    //TODO: FETCH TOOL'S MANDATORY DPOINTS HERE
    return [
      {
        id: '1',
        name: 'dpoint1',
        bits: 1,
        tool: {
          id: '3',
          long: 'Kimbi',
          name: 'Jup',
          type: ToolEnum.LWD,
          version: '1.0',
        },
      },
      {
        id: '2',
        name: 'dpoint2',
        bits: 1,
        tool: {
          id: '3',
          long: 'Kimbi',
          name: 'Jup',
          type: ToolEnum.LWD,
          version: '1.0',
        },
      },
    ];
  }

  function fetchToolServices() {
    //TODO: FETCH tool's mandatory SERVICES HERE
    setServices([
      {
        id: '1',
        name: 'service1',
        dpoints: [
          {
            id: '7',
            name: 'dpoint1',
            bits: 1,
            tool: {
              id: '3',
              long: 'Kimbi',
              name: 'Jup',
              type: ToolEnum.LWD,
              version: '1.0',
            },
          },
        ],
        tool: {
          id: '3',
          long: 'Kimbi',
          name: 'Jup',
          type: ToolEnum.LWD,
          version: '1.0',
        },
      },
      {
        id: '2',
        name: 'service2',
        dpoints: [
          {
            id: '8',
            name: 'dpoint2',
            bits: 1,
            tool: {
              id: '3',
              long: 'Kimbi',
              name: 'Jup',
              type: ToolEnum.LWD,
              version: '1.0',
            },
          },
        ],
        tool: {
          id: '3',
          long: 'Kimbi',
          name: 'Jup',
          type: ToolEnum.LWD,
          version: '1.0',
        },
      },
    ]);
  }

  function handleSelectTool() {
    setIsSelected((prev) => {
      const mandDpoints = mandatoryDPoints ?? fetchToolMandatoryDpoints();
      if (!mandatoryDPoints)
        setMandatoryDPoints((prev) => {
          setPrevMandatoryDPoints(prev);
          return mandDpoints;
        });
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

  useEffect(() => {
    getDPoints(selectedDPoints, prevSelectedDPoints);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDPoints]);

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
