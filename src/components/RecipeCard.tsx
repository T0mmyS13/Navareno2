import React from "react";
import { Card, CardContent, CardMedia, Typography, Rating, Box, Chip, Stack, CardActionArea } from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { motion } from "framer-motion";

export interface RecipeCardProps {
  recipe: {
    title: string;
    image: string;
    difficulty: number;
    time: number;
    rating: string | number;
    ratingsCount?: number;
    description: string;
    portion?: number | string;
    rating_count?: number;
    rating_sum?: number;
    slug: string;
    category: string;
  };
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  motionProps?: React.ComponentProps<typeof motion.div>;
}

function getDifficultyText(difficulty: number) {
  switch (difficulty) {
    case 1: return "Snadné";
    case 2: return "Střední";
    case 3: return "Obtížné";
    default: return "Neznámé";
  }
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick, className = "", style, motionProps }) => {
  return (
    <motion.div {...motionProps} className={className} style={style}>
      <Card
        sx={{ maxWidth: '100%', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '1.5rem', boxShadow: '0 4px 24px 0 rgba(33,150,243,0.08)' }}
        elevation={0}
        className="overflow-hidden bg-gradient-to-br from-white via-blue-50 to-blue-100 border border-blue-100 hover:border-blue-300 group"
      >
        <CardActionArea
          onClick={onClick}
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', p: 0 }}
        >
          <div className="relative">
            <CardMedia
              component="img"
              image={recipe.image}
              alt={recipe.title}
              sx={{ width: '100%', height: '200px', objectFit: 'cover', transition: 'transform 0.4s', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem' }}
              className="group-hover:scale-105"
            />
            <div className="absolute top-2 right-2 bg-white/80 rounded-full px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-md flex items-center gap-1">
              <AccessTimeIcon sx={{ color: '#1976d2', fontSize: 18 }} />
              <span>{recipe.time} min</span>
            </div>
          </div>
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
            <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.25rem' }, color: '#1565c0' }}>
              {recipe.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
              {recipe.description}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Chip
                icon={<FitnessCenterIcon sx={{ color: '#1976d2' }} />}
                label={getDifficultyText(recipe.difficulty)}
                variant="outlined"
                size="small"
                sx={{ borderColor: '#90caf9', color: '#1976d2', background: '#e3f2fd' }}
              />
              <Box display="flex" alignItems="center" ml={0.5}>
                <Rating
                  value={Number(recipe.rating_count) && Number(recipe.rating_sum) ? Number(recipe.rating_sum) / Number(recipe.rating_count) : 0}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{ color: '#ffd600', fontSize: { xs: 18, sm: 20 } }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, minWidth: 32 }}>
                  ({recipe.rating_count || 0}x)
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </motion.div>
  );
};

export default RecipeCard; 