"use client"

import {
    Box,
    Text,
    Heading,
    Grid,
    Stack,
    TextInput,
    CheckBox,
    Select,
    Spinner
} from 'grommet'
import { useEffect, useState, useMemo, useCallback } from 'react';
import ShadowBox from '../../../components/base/ShadowBox';
import IconImage, { AdaptativeIconImage } from '../../../components/base/IconImage';
import { Card, SkillsforIDCardPassiveBonus } from '../../../data/domain/cards';
import { CardSet } from '../../../data/domain/cardSets';
import TipDisplay from '../../../components/base/TipDisplay';
import { initCardSetRepo } from '../../../data/domain/data/CardSetRepo';
import { useAppDataStore } from '../../../lib/providers/appDataStoreProvider';
import { useShallow } from 'zustand/react/shallow';
import { Search } from 'grommet-icons';
import { SkillsIndex } from '../../../data/domain/SkillsIndex';


const shouldHideCard = ({ card, searchTerm, selectedBonusType, showPassiveOnly, showActiveOnly }: { card: Card, searchTerm: string, selectedBonusType: string, showPassiveOnly: boolean, showActiveOnly: boolean }) => {
    // Filter by name
    if (searchTerm && !card.displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
    }
    
    // Filter by passive/active status
    if (showPassiveOnly && !card.passive) {
        return true;
    }
    
    if (showActiveOnly && card.passive) {
        return true;
    }
    
    // Filter by bonus type
    if (selectedBonusType && selectedBonusType !== '') {
        // Check if the card's bonusID is in the list for the selected skill
        if (selectedBonusType.startsWith('skill_')) {
            const skillIndex = parseInt(selectedBonusType.split('_')[1]);
            const bonusIdsForSkill = SkillsforIDCardPassiveBonus[skillIndex as SkillsIndex] || [];
            return !bonusIdsForSkill.includes(card.bonusID);
        } else if (selectedBonusType === 'damage') {
            // Damage related bonuses
            const damageRelatedIds = [4, 18, 19, 21, 42, 63, 71, 72, 91];
            return !damageRelatedIds.includes(card.bonusID);
        } else if (selectedBonusType === 'exp') {
            // EXP related bonuses
            const expRelatedIds = [20, 22, 25, 28, 31, 40, 44, 49, 50, 76, 88, 89, 94, 95];
            return !expRelatedIds.includes(card.bonusID);
        } else if (selectedBonusType === 'stats') {
            // Stats related bonuses (STR, AGI, WIS, etc.)
            const statsRelatedIds = [1, 2, 3, 5, 7, 9, 26, 56, 61, 68, 82];
            return !statsRelatedIds.includes(card.bonusID);
        } else if (selectedBonusType === 'drop') {
            // Drop rate related bonuses
            const dropRelatedIds = [10, 12, 14, 64, 74];
            return !dropRelatedIds.includes(card.bonusID);
        }
    }
    
    return false;
}

const CardBox = ({ card, searchTerm, selectedBonusType, showPassiveOnly, showActiveOnly }: { card: Card, searchTerm: string, selectedBonusType: string, showPassiveOnly: boolean, showActiveOnly: boolean }) => {
    const currentCardLevel = card.getStars();
    const cardsToNextLevel = card.count > 0 ? (card.getCardsForStar(currentCardLevel + 1) - card.count) : 1;
    const isMaxed: boolean = (card.fivestar ? currentCardLevel == 5 : currentCardLevel == 4);

    // Check if the card should be hidden based on filters
    if (shouldHideCard({ card, searchTerm, selectedBonusType, showPassiveOnly, showActiveOnly })) {
        return null;
    }

    return (
        <ShadowBox background='dark-1' style={{ opacity: card.count > 0 ? 1 : 0.5 }} gap='small' pad='medium' align='left'>
            <TipDisplay
                heading={card.displayName + " Card"}
                body={
                    <Box margin={{ bottom: 'xsmall' }} width='auto' direction='column' gap='small'>
                        <Box width='100%' gap='none' align='start'>
                            <Text size="small">Cards collected : {card.count}</Text>
                            <Text size="small">Base drop rate : {card.getBaseDropRateText()}</Text>
                        </Box>
                        <Box direction='column'>
                            <Box direction='row' justify='start' align='center' gap='xxsmall'>
                                <IconImage data={Card.getStarImageForLevel(0)} />
                                <Text size="small"> : {card.getBonusText(0)} ({Math.floor(card.getCardsForStar(0))} cards)</Text>
                            </Box>
                            <Box direction='row' justify='start' align='center' gap='xxsmall'>
                                <IconImage data={Card.getStarImageForLevel(1)} />
                                <Text size="small"> : {card.getBonusText(1)} ({Math.floor(card.getCardsForStar(1))} cards)</Text>
                            </Box>
                            <Box direction='row' justify='start' align='center' gap='xxsmall'>
                                <IconImage data={Card.getStarImageForLevel(2)} />
                                <Text size="small"> : {card.getBonusText(2)} ({Math.floor(card.getCardsForStar(2))} cards)</Text>
                            </Box>
                            <Box direction='row' justify='start' align='center' gap='xxsmall'>
                                <IconImage data={Card.getStarImageForLevel(3)} />
                                <Text size="small"> : {card.getBonusText(3)} ({Math.floor(card.getCardsForStar(3))} cards)</Text>
                            </Box>
                            <Box direction='row' justify='start' align='center' gap='xxsmall'>
                                <IconImage data={Card.getStarImageForLevel(4)} />
                                <Text size="small"> : {card.getBonusText(4)} ({Math.floor(card.getCardsForStar(4))} cards)</Text>
                            </Box>
                            <Box direction='row' justify='start' align='center' gap='xxsmall'>
                                <IconImage data={Card.getStarImageForLevel(5)} />
                                <Text size="small"> : {card.getBonusText(5)} ({Math.floor(card.getCardsForStar(5))} cards)</Text>
                            </Box>
                        </Box>
                        {(!isMaxed) &&
                            <Box>
                                <Text size="small">Next card level in {Math.floor(cardsToNextLevel)} cards</Text>
                                {cardsToNextLevel != Math.floor(cardsToNextLevel) && <Text size="small">/!\ In-game will say {Math.ceil(cardsToNextLevel)} but it's technically {Math.floor(cardsToNextLevel)} due to rounding shenanigans</Text>}
                            </Box>
                        }
                    </Box>
                }
            >
                <Box direction='row' gap='small' align='left'>
                    <Box direction='column' gap='small' align='center'>
                        <Stack>
                            <Box>
                                <IconImage data={card.getImageData()} />
                            </Box>
                            <Box>
                                <IconImage data={card.getBorderImageData()} />
                            </Box>
                        </Stack>
                    </Box>
                    <Box direction='column' gap='none' align='left'>
                        <Text size='medium'>{card.displayName}</Text>
                        <Text size='small' color={card.passive ? 'rgb(50,168,121)' : ''}>{card.getBonusText() + ((card.passive && !card.data.effect.endsWith('(Passive)')) ? ' (Passive)' : '')}</Text>
                        {(!isMaxed) && <Text size="xsmall" color={'grey'}>{card.count} / {(card.getCardsForStar(5))}</Text>}
                    </Box>
                </Box>
            </TipDisplay>
        </ShadowBox>
    )
}

const CardSetBox = ({ cardSet, searchTerm, selectedBonusType, showPassiveOnly, showActiveOnly }: { cardSet: CardSet, searchTerm: string, selectedBonusType: string, showPassiveOnly: boolean, showActiveOnly: boolean }) => {
    const currentLevel = cardSet.getLevel();
    const nextLevel = currentLevel + 1;
    const totalCardLevels = cardSet.getCardsTotalStars()

    return (
        <Box background='dark-1' style={{ opacity: cardSet.cards?.reduce((sum, card) => { return sum + card.count; }, 0) > 0 ? 1 : 0.5 }} gap='small' pad='medium'>
            <Box direction='column' gap='small' align='center'>
                <TipDisplay
                    heading={cardSet.displayName + " Set"}
                    body={
                        <Box margin={{ bottom: 'xsmall' }} direction='column' gap='medium'>
                            <Text size="small">Cards levels : {totalCardLevels} / {cardSet.cards?.length * 6}</Text>
                            {(currentLevel < 6) &&
                                <Box direction='column' gap='xsmall'>
                                    <Text size="small">Next bonus level in {(cardSet.cards?.length * (nextLevel)) - totalCardLevels} card levels :</Text>
                                    <Text size="small">{cardSet.getBonusText(nextLevel)}</Text>
                                </Box>
                            }
                        </Box>
                    }
                >
                    <Box direction='row' gap='small' align='center'>
                        <Stack>
                            <Box>
                                <IconImage data={cardSet.getImageData()} />
                            </Box>
                            <Box>
                                <IconImage data={cardSet.getBorderImageData()} />
                            </Box>
                        </Stack>
                        <Box direction='column' gap='none'>
                            <AdaptativeIconImage data={cardSet.getBannerImageData()} />
                            <Text size='medium' color={cardSet.getBonus() == 0 ? 'grey' : ''}>{cardSet.getBonusText()}</Text>
                        </Box>
                    </Box>
                </TipDisplay>
                <Grid width='100%' columns='small' gap='small'>
                    {
                        cardSet.cards && cardSet.cards
                            .sort((a: Card, b: Card) => a.data.order - b.data.order)
                            .map((card: Card, index: number) => {
                                // Only render cards that shouldn't be hidden
                                if (!shouldHideCard({ card, searchTerm, selectedBonusType, showPassiveOnly, showActiveOnly })) {
                                    return <CardBox key={index} card={card} searchTerm={searchTerm} selectedBonusType={selectedBonusType} showPassiveOnly={showPassiveOnly} showActiveOnly={showActiveOnly} />
                                }
                                return null;
                            })
                            .filter(Boolean) // Remove null elements
                    }
                </Grid>
            </Box>
        </Box>
    )
}

// Custom hook for debounced value
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set a timeout to update the debounced value after the specified delay
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clear the timeout if the value changes or the component unmounts
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Create a component for the search bar
const CardSearchBar = ({ 
    searchTerm, 
    setSearchTerm, 
    selectedBonusType, 
    setSelectedBonusType,
    showPassiveOnly,
    setShowPassiveOnly,
    showActiveOnly,
    setShowActiveOnly
}: { 
    searchTerm: string, 
    setSearchTerm: (term: string) => void, 
    selectedBonusType: string, 
    setSelectedBonusType: (type: string) => void,
    showPassiveOnly: boolean,
    setShowPassiveOnly: (show: boolean) => void,
    showActiveOnly: boolean,
    setShowActiveOnly: (show: boolean) => void
}) => {
    // Use local state for immediate input value
    const [inputValue, setInputValue] = useState(searchTerm);
    
    // Update the actual search term with debounce
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }, []);
    
    // Apply the debounced value to the actual search term
    useEffect(() => {
        // Special case for empty search - apply immediately for better UX
        if (inputValue === '') {
            setSearchTerm('');
            return;
        }
        
        // Otherwise use debounce for non-empty searches
        const timer = setTimeout(() => {
            setSearchTerm(inputValue);
        }, 100);
        
        return () => clearTimeout(timer);
    }, [inputValue, setSearchTerm]);
    // Create bonus type options
    const bonusTypeOptions = [
        { label: 'All Types', value: '' },
        { label: 'Damage', value: 'damage' },
        { label: 'EXP', value: 'exp' },
        { label: 'Stats', value: 'stats' },
        { label: 'Drop Rate', value: 'drop' },
        { label: 'Mining', value: 'skill_0' },
        { label: 'Smithing', value: 'skill_1' },
        { label: 'Chopping', value: 'skill_2' },
        { label: 'Fishing', value: 'skill_3' },
        { label: 'Alchemy', value: 'skill_4' },
        { label: 'Catching', value: 'skill_5' },
        { label: 'Trapping', value: 'skill_6' },
        { label: 'Construction', value: 'skill_7' },
        { label: 'Worship', value: 'skill_8' },
        { label: 'Cooking', value: 'skill_9' },
        { label: 'Breeding', value: 'skill_10' },
        { label: 'Intellect', value: 'skill_11' },
        { label: 'Sailing', value: 'skill_12' },
        { label: 'Divinity', value: 'skill_13' },
        { label: 'Gaming', value: 'skill_14' },
        { label: 'Farming', value: 'skill_15' },
        { label: 'Sneaking', value: 'skill_16' },
        { label: 'Summoning', value: 'skill_17' }
    ];

    return (
        <ShadowBox background="dark-1" pad="medium" gap="small">
            <Heading level="3" size="small" margin="none">Card Search</Heading>
            
            <Box direction="row" gap="medium" align="center" wrap>
                <Box width="medium">
                    <TextInput
                        icon={<Search />}
                        placeholder="Search by card name"
                        value={inputValue}
                        onChange={handleSearchChange}
                    />
                </Box>
                
                <Box width="medium">
                    <Select
                        placeholder="Filter by bonus type"
                        options={bonusTypeOptions}
                        labelKey="label"
                        valueKey={{ key: 'value', reduce: true }}
                        value={selectedBonusType}
                        onChange={({ value }) => setSelectedBonusType(value)}
                        clear={{ label: 'Clear filter' }}
                    />
                </Box>
                
                <Box direction="row" gap="medium">
                    <CheckBox
                        label="Passive Only"
                        checked={showPassiveOnly}
                        onChange={(e) => {
                            setShowPassiveOnly(e.target.checked);
                            if (e.target.checked) setShowActiveOnly(false);
                        }}
                    />
                    
                    <CheckBox
                        label="Active Only"
                        checked={showActiveOnly}
                        onChange={(e) => {
                            setShowActiveOnly(e.target.checked);
                            if (e.target.checked) setShowPassiveOnly(false);
                        }}
                    />
                </Box>
            </Box>
        </ShadowBox>
    );
};

function CardsDisplay() {
    const [cards, setCardsData] = useState<Card[]>();
    const cardSets = CardSet.fromBase(initCardSetRepo(), cards) as CardSet[];
    const { theData } = useAppDataStore(useShallow(
        (state) => ({ theData: state.data.getData(), lastUpdated: state.lastUpdated })
    ));
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBonusType, setSelectedBonusType] = useState<string>('');
    const [showPassiveOnly, setShowPassiveOnly] = useState(false);
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    
    // Track if any filtering is active
    const isFilterActive = searchTerm !== '' || selectedBonusType !== '' || showPassiveOnly || showActiveOnly;
    
    // Cache the original card sets to avoid recalculation when filters are cleared
    const originalCardSets = useMemo(() => {
        if (cards && cardSets && cardSets.length > 0) {
            return [...cardSets];
        }
        return [];
    }, [cards, cardSets]);
    
    // Effect to handle filtering state - only run when filters change
    useEffect(() => {
        // Set filtering state based on filter activity
        if (isFilterActive) {
            setIsFiltering(true);
            
            // Use a small timeout to allow the UI to update with the loading state
            const timer = setTimeout(() => {
                setIsFiltering(false);
            }, 50);
            
            return () => clearTimeout(timer);
        } else {
            setIsFiltering(false);
        }
    }, [isFilterActive]);

    // Calculate visible card sets (sets with at least one visible card after filtering)
    const visibleCardSets = useMemo(() => {      
        if (!cards || !cardSets) {
            return [];
        }
        
        // If no filters are active, return the original card sets (fast path)
        if (!isFilterActive) {
            return originalCardSets.length > 0 ? originalCardSets : cardSets;
        }
        
        // Filter the card sets
        const filteredCardSets = cardSets.filter(cardSet => {
            if (!cardSet.cards || cardSet.cards.length === 0) return false;
            
            // Check if any card in the set is visible after filtering
            return cardSet.cards.some(card => 
                !shouldHideCard({ 
                    card, 
                    searchTerm, 
                    selectedBonusType, 
                    showPassiveOnly, 
                    showActiveOnly 
                })
            );
        });
        
        // Return the filtered result
        return filteredCardSets;
    }, [cardSets, cards, originalCardSets, searchTerm, selectedBonusType, showPassiveOnly, showActiveOnly, isFilterActive]);
    
    useEffect(() => {
        setCardsData(theData.get("cards"));
    }, [theData]);
    
    // Assign cards to card sets only when cards change
    useEffect(() => {
        if (cards && cardSets) {
            cardSets.forEach(cardSet => { 
                cardSet.cards = cards.filter(card => card.data.category === cardSet.cardSetName);
            });
        }
    }, [cards, cardSets])

    if (!cards || !cardSets) {
        return null;
    }


    return (
        <Box gap='medium'>
            <Heading level='2' size='medium' style={{ fontWeight: 'normal' }}>Cards</Heading>
            
            <CardSearchBar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                selectedBonusType={selectedBonusType} 
                setSelectedBonusType={setSelectedBonusType}
                showPassiveOnly={showPassiveOnly}
                setShowPassiveOnly={setShowPassiveOnly}
                showActiveOnly={showActiveOnly}
                setShowActiveOnly={setShowActiveOnly}
            />
            
            {isFiltering ? (
                <Box pad="medium" align="center" gap="small">
                    <Box direction="row" gap="small" align="center">
                        <Text size="large">Filtering cards...</Text>
                        <Spinner />
                    </Box>
                </Box>
            ) : visibleCardSets && visibleCardSets.length > 0 ? (
                <Grid columns={{ size: 'auto', count: 1 }} gap='medium'>
                    {
                        visibleCardSets.map((cardSet, index) => 
                            <CardSetBox 
                                key={index} 
                                cardSet={cardSet} 
                                searchTerm={searchTerm} 
                                selectedBonusType={selectedBonusType} 
                                showPassiveOnly={showPassiveOnly} 
                                showActiveOnly={showActiveOnly} 
                            />
                        )
                    }
                </Grid>
            ) : (
                <Box pad="medium" align="center">
                    <Text>No cards match your search criteria.</Text>
                </Box>
            )}
        </Box>
    )
}

export default CardsDisplay;