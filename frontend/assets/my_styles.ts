import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#1a1a2e',        
  secondary: '#16213e',       
  accent: '#0f3460',          
  highlight: '#e94560',       
  text: '#ffffff',            
  textSecondary: '#b8b8b8',   
  border: '#2a2a3e',          
  success: '#00d4aa',         
  warning: '#ffa726',         
  card: '#1e1e3e',            
  input: '#252540',           
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: 44,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.highlight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  buttonSecondary: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  label: {
    ...typography.bodySmall,
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: colors.highlight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
});